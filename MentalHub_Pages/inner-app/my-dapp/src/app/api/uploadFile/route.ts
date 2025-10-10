import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Convertir el archivo a FormData para enviarlo a Pinata
    const pinataFormData = new FormData();
    pinataFormData.append('file', file);
    
    // Metadatos opcionales
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: 'innerverse-dapp'
      }
    });
    pinataFormData.append('pinataMetadata', metadata);

    // Opciones de Pinata
    const options = JSON.stringify({
      cidVersion: 0,
    });
    pinataFormData.append('pinataOptions', options);

    // Subir a Pinata
    const pinataResponse = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'pinata_api_key': process.env.PINATA_API_KEY || '',
        'pinata_secret_api_key': process.env.PINATA_SECRET_API_KEY || '',
      },
      body: pinataFormData,
    });

    if (!pinataResponse.ok) {
      const errorText = await pinataResponse.text();
      console.error('Pinata error:', errorText);
      return NextResponse.json({ error: 'Failed to upload to IPFS' }, { status: 500 });
    }

    const pinataResult = await pinataResponse.json();
    
    // Retornar el hash de IPFS en el formato esperado por el componente
    return NextResponse.json({
      IpfsHash: pinataResult.IpfsHash,
      PinSize: pinataResult.PinSize,
      Timestamp: pinataResult.Timestamp
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
