import express, { Request, Response } from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

dotenv.config();

export const app = express();

const SUPABASE_URL = (
  process.env.SUPABASE_URL ||
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).trim();
const SUPABASE_KEY = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  ''
).trim();
const BUCKET_NAME = process.env.SUPABASE_BUCKET || 'lab-notebooks';

// Known PIN to Name mapping
const KNOWN_USERS: Record<string, string> = {
  '141106': 'Pratyush Panda',
};

app.use(cors());
app.use(express.json());

// Memory storage for multer - accepts any file type (.py, .java, .ipynb, etc.)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100 MB max limit
  },
});

// Cache for companion metadata to avoid repeated downloads
const metaCache: Map<
  string,
  {
    comment?: string;
    uploaderName?: string;
    pin?: string;
    originalName?: string;
    created_at?: string;
  }
> = new Map();

// Initialize Supabase Client
let supabase: SupabaseClient | null = null;
if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });
    console.log('[Supabase] Initialized client for:', SUPABASE_URL);
  } catch (err) {
    console.error('[Supabase] Failed to initialize Supabase client:', err);
  }
}

// Helper to determine uploader name
function resolveUploaderName(pin: string, customName?: string): string {
  if (customName && customName.trim()) {
    return customName.trim();
  }
  if (KNOWN_USERS[pin]) {
    return KNOWN_USERS[pin];
  }
  return 'Lab Student';
}

/**
 * Health check endpoint
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    supabaseConnected: !!supabase,
    bucket: BUCKET_NAME,
  });
});

/**
 * POST /api/upload
 * Directly uploads to Supabase Storage bucket 'lab-notebooks'
 */
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const rawPin = (req.body?.pin || req.headers['x-vault-pin']) as string;
    const pin = (rawPin || '').trim();
    const comment = (req.body?.comment || '').trim();
    const customUploader = (req.body?.uploaderName || '').trim();

    if (!pin || !/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        error: 'A valid 6-digit master PIN is required.',
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No file uploaded or file was rejected.',
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase storage is not configured. Please check your environment variables.',
      });
    }

    const uploaderName = resolveUploaderName(pin, customUploader);
    const originalName = req.file.originalname;
    const timestamp = Date.now();
    const safeFileName = `${timestamp}_${originalName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const createdAt = new Date().toISOString();

    // 1. Upload file buffer to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(safeFileName, req.file.buffer, {
        contentType: req.file.mimetype || 'application/octet-stream',
        upsert: true,
      });

    if (uploadError) {
      console.error('[Supabase Upload Error]', uploadError);
      return res.status(400).json({
        success: false,
        error: `Supabase Storage error: ${uploadError.message}. Please make sure bucket "${BUCKET_NAME}" exists in your Supabase dashboard (Storage > New Bucket).`,
      });
    }

    // 2. Save companion metadata file for comments, uploaderName, and PIN mapping
    const metaPayload = JSON.stringify({
      name: originalName,
      comment,
      uploaderName,
      pin,
      size: req.file.size,
      created_at: createdAt,
    });

    metaCache.set(safeFileName, {
      comment,
      uploaderName,
      pin,
      originalName,
      created_at: createdAt,
    });

    supabase.storage
      .from(BUCKET_NAME)
      .upload(`${safeFileName}.meta.json`, Buffer.from(metaPayload, 'utf-8'), {
        contentType: 'application/json',
        upsert: true,
      })
      .catch((e) => console.warn('[Metadata Save Warning]', e));

    return res.status(200).json({
      success: true,
      message: 'File successfully uploaded to Supabase Storage.',
      file: {
        key: safeFileName,
        name: originalName,
        size: req.file.size,
        created_at: createdAt,
        comment,
        uploaderName,
        path: uploadData?.path,
      },
    });
  } catch (err: any) {
    console.error('[Upload Exception]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during upload.',
    });
  }
});

/**
 * GET /api/files
 * Exclusively returns real files from Supabase Storage (zero simulated files)
 * - If ?dashboard=true or ?all=true: returns all real uploaded files
 * - If ?pin=141106: returns real files matching that PIN
 */
app.get('/api/files', async (req: Request, res: Response) => {
  try {
    const rawPin = (req.query.pin || req.headers['x-vault-pin']) as string;
    const pin = (rawPin || '').trim();
    const isDashboard = req.query.dashboard === 'true' || req.query.all === 'true' || !pin;

    // For Retrieve mode: require valid 6-digit PIN
    if (!isDashboard) {
      if (!pin || !/^\d{6}$/.test(pin)) {
        return res.status(400).json({
          success: false,
          error: 'Please enter your 6-digit master PIN to retrieve files.',
        });
      }
    }

    if (!supabase) {
      return res.status(200).json({
        success: true,
        files: [],
        storageType: 'supabase',
      });
    }

    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        limit: 100,
        sortBy: { column: 'created_at', order: 'desc' },
      });

    if (error) {
      // If bucket doesn't exist yet or is empty, return empty list without crashing
      console.warn('[Supabase List Notice]', error.message);
      return res.status(200).json({
        success: true,
        files: [],
        storageType: 'supabase',
        notice: `Bucket "${BUCKET_NAME}" not found or empty.`,
      });
    }

    // Filter real files (exclude companion .meta.json helper files)
    const fileEntries = (data || []).filter(
      (f) => f.name && !f.name.endsWith('.meta.json')
    );

    // Resolve metadata (comment, uploaderName, pin) directly from Supabase
    const resolvedFiles = await Promise.all(
      fileEntries.map(async (f) => {
        const match = f.name.match(/^(\d+)_(.+)$/);
        const timestampPrefix = match ? parseInt(match[1], 10) : null;
        const displayName = match ? match[2] : f.name;

        let meta = metaCache.get(f.name);

        // If not cached, download companion .meta.json from Supabase
        if (!meta) {
          try {
            const { data: metaBlob } = await supabase!.storage
              .from(BUCKET_NAME)
              .download(`${f.name}.meta.json`);

            if (metaBlob) {
              const text = await metaBlob.text();
              const parsed = JSON.parse(text);
              meta = {
                comment: parsed.comment || '',
                uploaderName: parsed.uploaderName || 'Pratyush Panda',
                pin: parsed.pin || '141106',
                originalName: displayName,
                created_at: parsed.created_at || f.created_at,
              };
              metaCache.set(f.name, meta);
            }
          } catch {
            meta = {
              comment: '',
              uploaderName: 'Pratyush Panda',
              pin: '141106',
              originalName: displayName,
              created_at: f.created_at,
            };
          }
        }

        let createdAt = meta?.created_at || f.created_at;
        if (!createdAt && timestampPrefix) {
          createdAt = new Date(timestampPrefix).toISOString();
        }

        return {
          key: f.name,
          name: displayName,
          size: f.metadata?.size || 0,
          created_at: createdAt || new Date().toISOString(),
          updated_at: f.updated_at || createdAt,
          comment: meta?.comment || '',
          uploaderName: meta?.uploaderName || 'Pratyush Panda',
          pin: meta?.pin || '141106',
        };
      })
    );

    // Sort newest first
    const allFiles = resolvedFiles.sort((a, b) => {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

    // If Retrieve mode: filter by the specific PIN entered
    const finalFiles = isDashboard
      ? allFiles
      : allFiles.filter((f) => f.pin === pin);

    return res.status(200).json({
      success: true,
      files: finalFiles,
      storageType: 'supabase',
    });
  } catch (err: any) {
    console.error('[List Files Exception]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error while fetching files.',
    });
  }
});

/**
 * GET /api/download/:fileKey
 * Streams raw binary file directly from Supabase Storage
 */
app.get('/api/download/:fileKey', async (req: Request, res: Response) => {
  try {
    const fileKey = req.params.fileKey;

    if (!fileKey) {
      return res.status(400).json({
        success: false,
        error: 'File key is required.',
      });
    }

    if (!supabase) {
      return res.status(500).json({
        success: false,
        error: 'Supabase storage not configured.',
      });
    }

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from(BUCKET_NAME)
      .download(fileKey);

    if (downloadError || !fileBlob) {
      return res.status(404).json({
        success: false,
        error: downloadError?.message || 'File not found in Supabase Storage.',
      });
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const match = fileKey.match(/^\d+_(.+)$/);
    const displayName = match ? match[1] : fileKey;

    res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(displayName)}"`);
    res.setHeader('Content-Type', 'application/octet-stream');
    return res.send(buffer);
  } catch (err: any) {
    console.error('[Download Exception]', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Internal server error during download.',
    });
  }
});

/**
 * DELETE /api/files/:fileKey
 * Deletes real file and companion metadata directly from Supabase Storage
 */
app.delete('/api/files/:fileKey', async (req: Request, res: Response) => {
  try {
    const fileKey = req.params.fileKey;

    if (!fileKey) {
      return res.status(400).json({ success: false, error: 'File key is required.' });
    }

    metaCache.delete(fileKey);

    if (supabase) {
      const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileKey, `${fileKey}.meta.json`]);
      if (error) {
        return res.status(400).json({ success: false, error: error.message });
      }
    }

    return res.json({ success: true, message: 'File deleted from Supabase Storage.' });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});
