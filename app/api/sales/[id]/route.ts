import { NextRequest, NextResponse } from 'next/server';
import { getMongoClient, checkConnection } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { readSalesFromFile, deleteSaleFromFile, updateSaleInFile } from '@/lib/file-storage';

const USE_FILE_STORAGE = process.env.USE_FILE_STORAGE === 'true' || process.env.NODE_ENV === 'development'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    let result;

    if (USE_FILE_STORAGE) {
      // Gunakan file storage
      console.log('📁 Using file storage for development - DELETE')
      const deleted = await deleteSaleFromFile(id)
      if (!deleted) {
        return NextResponse.json(
          { success: false, message: 'Data penjualan tidak ditemukan' },
          { status: 404 }
        )
      }
      result = { deletedCount: 1 }
    } else {
      // Coba MongoDB dulu, fallback ke file storage
      try {
        const isConnected = await checkConnection()
        if (!isConnected) {
          throw new Error('MongoDB not connected')
        }

        // Validasi ObjectId hanya untuk MongoDB
        if (!ObjectId.isValid(id)) {
          return NextResponse.json(
            { success: false, message: 'ID penjualan tidak valid' },
            { status: 400 }
          )
        }

        const client = await getMongoClient()
        const db = client.db('fng-app')
        result = await db.collection('sales').deleteOne({ 
          _id: new ObjectId(id) 
        })
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError)
        const deleted = await deleteSaleFromFile(id)
        if (!deleted) {
          return NextResponse.json(
            { success: false, message: 'Data penjualan tidak ditemukan' },
            { status: 404 }
          )
        }
        result = { deletedCount: 1 }
      }
    }

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Data penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Penjualan berhasil dihapus' 
    })
  } catch (error: any) {
    console.error('Error deleting sale:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const updateData = {
      ...body,
      updatedAt: new Date().toISOString(),
      payment: body.payment ? {
        ...body.payment,
        updatedAt: new Date().toISOString()
      } : undefined
    };

    let result;

    if (USE_FILE_STORAGE) {
      result = await updateSaleInFile(id, updateData);
    } else {
      try {
        const isConnected = await checkConnection();
        if (!isConnected) throw new Error('MongoDB not connected');

        if (!ObjectId.isValid(id)) {
          return NextResponse.json(
            { success: false, message: 'ID penjualan tidak valid' },
            { status: 400 }
          );
        }

        const client = await getMongoClient();
        const db = client.db('fng-app');
        result = await db.collection('sales').updateOne(
          { _id: new ObjectId(id) },
          { $set: updateData }
        );
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError);
        result = await updateSaleInFile(id, updateData);
      }
    }

    if (!result || (result.matchedCount === 0 && result.modifiedCount === 0)) {
      return NextResponse.json(
        { success: false, message: 'Data penjualan tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Data penjualan berhasil diupdate'
    });
  } catch (error: any) {
    console.error('Error updating sale:', error);
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server: ' + error.message },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    let sale;

    if (USE_FILE_STORAGE) {
      const sales = await readSalesFromFile()
      sale = sales.find(s => s._id === id)
    } else {
      try {
        const isConnected = await checkConnection()
        if (!isConnected) {
          throw new Error('MongoDB not connected')
        }

        if (!ObjectId.isValid(id)) {
          return NextResponse.json(
            { success: false, message: 'ID penjualan tidak valid' },
            { status: 400 }
          )
        }

        const client = await getMongoClient()
        const db = client.db('fng-app')
        sale = await db.collection('sales').findOne({ 
          _id: new ObjectId(id) 
        })
      } catch (mongoError) {
        console.warn('MongoDB failed, using file storage:', mongoError)
        const sales = await readSalesFromFile()
        sale = sales.find(s => s._id === id)
      }
    }

    if (!sale) {
      return NextResponse.json(
        { success: false, message: 'Data penjualan tidak ditemukan' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: sale })
  } catch (error: any) {
    console.error('Error fetching sale:', error)
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}