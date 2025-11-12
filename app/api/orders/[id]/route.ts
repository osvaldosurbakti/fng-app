import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { getMongoClient } from '@/lib/mongodb';

// Interface untuk params yang sudah di-resolve
interface ResolvedParams {
  params: {
    id: string;
  };
}

export async function PATCH(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // ✅ params adalah Promise
) {
  try {
    // ✅ Await params terlebih dahulu
    const resolvedParams = await params;
    const { id } = resolvedParams;
    
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    const { status, paymentStatus } = body;

    // Validasi status order
    if (status) {
      const validStatuses = ['pending', 'preparing', 'ready', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { error: 'Invalid order status' },
          { status: 400 }
        );
      }
    }

    // Validasi payment status
    if (paymentStatus) {
      const validPaymentStatuses = ['paid', 'unpaid', 'partial'];
      if (!validPaymentStatuses.includes(paymentStatus)) {
        return NextResponse.json(
          { error: 'Invalid payment status' },
          { status: 400 }
        );
      }
    }

    // Pastikan ada field yang diupdate
    if (!status && !paymentStatus) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    const client = await getMongoClient();
    const db = client.db('fng-login');

    // Build update object dynamically
    const updateData: any = {
      updatedAt: new Date()
    };

    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;

    console.log(`🔄 Updating order ${id} with:`, updateData);

    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(id) },
      { 
        $set: updateData
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Order ${id} updated successfully`);
    return NextResponse.json({ 
      success: true,
      message: 'Order updated successfully',
      updatedFields: Object.keys(updateData).filter(key => key !== 'updatedAt')
    });
    
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { error: 'Failed to update order' },
      { status: 500 }
    );
  }
}

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // ✅ params adalah Promise
) {
  try {
    // ✅ Await params terlebih dahulu
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const client = await getMongoClient();
    const db = client.db('fng-login');

    console.log(`🔍 Fetching order ${id}`);

    const order = await db.collection('orders').findOne({
      _id: new ObjectId(id)
    });

    if (!order) {
      console.log(`❌ Order ${id} not found`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Transform data
    const formattedOrder = {
      _id: order._id?.toString(),
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderType: order.orderType,
      items: order.items || [],
      totalAmount: order.totalAmount || 0,
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'unpaid',
      paymentMethod: order.paymentMethod || 'cash',
      createdAt: order.createdAt,
      estimatedReadyTime: order.estimatedReadyTime,
      updatedAt: order.updatedAt,
      notes: order.notes || '',
      preparationTime: order.preparationTime || 0,
      customerPhone: order.customerPhone || '',
      customerAddress: order.customerAddress || ''
    };

    console.log(`✅ Order ${id} fetched successfully`);
    return NextResponse.json(formattedOrder);
    
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } // ✅ params adalah Promise
) {
  try {
    // ✅ Await params terlebih dahulu
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const client = await getMongoClient();
    const db = client.db('fng-login');

    console.log(`🗑️ Deleting order ${id}`);

    const result = await db.collection('orders').deleteOne({
      _id: new ObjectId(id)
    });

    if (result.deletedCount === 0) {
      console.log(`❌ Order ${id} not found for deletion`);
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    console.log(`✅ Order ${id} deleted successfully`);
    return NextResponse.json({ 
      success: true,
      message: 'Order deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting order:', error);
    return NextResponse.json(
      { error: 'Failed to delete order' },
      { status: 500 }
    );
  }
}