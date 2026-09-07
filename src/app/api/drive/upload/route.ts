import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { Readable } from 'stream';

function bufferToStream(buffer: Buffer): Readable {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const songId = formData.get('songId') as string;
    const key = formData.get('key') as string;
    const label = formData.get('label') as string;
    const userId = formData.get('userId') as string;

    if (!file) {
      return NextResponse.json({ error: 'No se envió ningún archivo' }, { status: 400 });
    }

    // Configurar cliente de Google Drive
    let authClient: any;

    const clientId = process.env.GOOGLE_DRIVE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_DRIVE_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_DRIVE_REFRESH_TOKEN;

    const serviceEmail = process.env.GOOGLE_DRIVE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_DRIVE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

    if (clientId && clientSecret && refreshToken) {
      // Método 1: OAuth2 Refresh Token (Sin bloqueo de políticas de empresa)
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      authClient = oauth2Client;
    } else if (serviceEmail && privateKey) {
      // Método 2: Service Account
      authClient = new google.auth.JWT({
        email: serviceEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive'],
      });
    } else {
      return NextResponse.json(
        { 
          error: 'Faltan las credenciales de Google Drive en las variables de entorno (GOOGLE_DRIVE_CLIENT_ID / GOOGLE_DRIVE_REFRESH_TOKEN o Service Account).' 
        }, 
        { status: 500 }
      );
    }

    const drive = google.drive({ version: 'v3', auth: authClient });

    // Convertir el archivo File a Buffer y Stream
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const mediaStream = bufferToStream(buffer);

    const fileName = `${key}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

    // Subir el archivo a Google Drive
    const fileMetadata: any = {
      name: fileName,
      description: `Cifrado de Alabanza - Tono ${key} - Canción ID: ${songId}`,
    };

    if (folderId) {
      fileMetadata.parents = [folderId];
    }

    const driveResponse = await drive.files.create({
      requestBody: fileMetadata,
      media: {
        mimeType: 'application/pdf',
        body: mediaStream,
      },
      fields: 'id, name, webViewLink, webContentLink',
    });

    const fileId = driveResponse.data.id;
    if (!fileId) {
      throw new Error('No se pudo obtener el ID del archivo en Google Drive');
    }

    // Dar permisos de lectura pública al archivo para visualización en la app
    try {
      await drive.permissions.create({
        fileId,
        requestBody: {
          role: 'reader',
          type: 'anyone',
        },
      });
    } catch (permError) {
      console.warn('Permisos de lectura en Drive ya existentes o administrados por carpeta.');
    }

    const previewUrl = `https://drive.google.com/file/d/${fileId}/preview`;
    const downloadUrl = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;

    return NextResponse.json({
      success: true,
      fileId,
      fileName: file.name,
      fileSize: file.size,
      previewUrl,
      downloadUrl,
      key,
      label: label || `Cifrado en ${key}`,
    });
  } catch (error: any) {
    console.error('Error subiendo a Google Drive:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar la subida a Google Drive' },
      { status: 500 }
    );
  }
}
