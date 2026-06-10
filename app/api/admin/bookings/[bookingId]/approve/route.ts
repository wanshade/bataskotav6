import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params;
  try {
    // Check if user is authenticated and is admin
    const session = await getServerSession(authOptions);

    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }



    // Check if DATABASE_URL is configured
    const hasDatabaseConfigured = !!process.env.DATABASE_URL;

    if (hasDatabaseConfigured) {
      try {
        const { db } = await import('@/lib/db');
        const { bookings } = await import('@/lib/schema');
        const { eq } = await import('drizzle-orm');

        // Update booking status to confirmed
        const [updatedBooking] = await db
          .update(bookings)
          .set({
            status: 'confirmed',
            approvedAt: new Date(),
            approvedBy: session.user.email || 'admin'
          })
          .where(eq(bookings.bookingId, bookingId))
          .returning();

        if (!updatedBooking) {
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          );
        }

        // Send WhatsApp confirmation message
        try {
          let formattedPhone = updatedBooking.phone.trim();
          if (formattedPhone.startsWith('0')) {
            formattedPhone = '62' + formattedPhone.slice(1);
          } else if (!formattedPhone.startsWith('62')) {
            formattedPhone = '62' + formattedPhone;
          }
          const chatId = `${formattedPhone}@c.us`;

          const priceFormatted = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
          }).format(updatedBooking.price);

          const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://bataskotapoint.com';
          const receiptUrl = `${baseUrl}/receipt/${updatedBooking.bookingId}`;

          const confirmationText = `✅ *PEMBAYARAN DITERIMA!*

Halo *${updatedBooking.teamName}*! 👋

Pembayaran booking Anda telah kami terima dan dikonfirmasi.

📋 *Detail Booking:*
• ID: ${updatedBooking.bookingId}
• Tanggal: ${updatedBooking.bookingDate}
• Waktu: ${updatedBooking.timeSlot}
• Total: ${priceFormatted}

🧾 *Kwitansi Pembayaran:*
${receiptUrl}

Silakan simpan kwitansi di atas sebagai bukti pembayaran Anda.

⏰ Harap datang 15 menit sebelum jadwal bermain.

Terima kasih telah memilih Batas Kota! ⚽

_Batas Kota - The Town Space_`;

          const waApiEndpoint = process.env.NEXT_PUBLIC_WHATSAPP_API_ENDPOINT;
          if (waApiEndpoint) {
            await fetch(waApiEndpoint, {
              method: 'POST',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Api-Key': process.env.NEXT_PUBLIC_WHATSAPP_API_KEY || '',
              },
              body: JSON.stringify({
                chatId: chatId,
                reply_to: null,
                text: confirmationText,
                linkPreview: true,
                linkPreviewHighQuality: false,
                session: 'default'
              }),
            });
            console.log('WhatsApp confirmation sent to:', chatId);
          }
        } catch (waError) {
          console.error('Failed to send WhatsApp confirmation:', waError);
        }

        return NextResponse.json({
          success: true,
          booking: updatedBooking,
          message: 'Booking approved successfully'
        });
      } catch (dbError) {
        console.error('Database error:', dbError);
        return NextResponse.json(
          { error: 'Database operation failed' },
          { status: 500 }
        );
      }
    } else {
      // For temporary storage, this would need more complex implementation
      return NextResponse.json(
        { error: 'Database not configured. Cannot update booking status.' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Approve booking error:', error);

    return NextResponse.json(
      {
        error: 'Failed to approve booking',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
