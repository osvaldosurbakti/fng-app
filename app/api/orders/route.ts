import { NextResponse } from 'next/server';
import { getMongoClient } from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await getMongoClient();
    const db = client.db();
    
    console.log('🔍 Fetching orders from database...');
    
    const orders = await db.collection('orders')
      .find({})
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    console.log(`📦 Found ${orders.length} orders from database`);

    // Transform data untuk response
    const formattedOrders = orders.map((order: any) => ({
      _id: order._id?.toString(),
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      orderType: order.orderType,
      items: order.items,
      totalAmount: order.totalAmount,
      status: order.status || 'pending',
      paymentStatus: order.paymentStatus || 'unpaid',
      paymentMethod: order.paymentMethod || 'cash',
      createdAt: order.createdAt,
      estimatedReadyTime: order.estimatedReadyTime,
      updatedAt: order.updatedAt
    }));

    return NextResponse.json(formattedOrders);
    
  } catch (error) {
    console.error('❌ Error fetching orders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}