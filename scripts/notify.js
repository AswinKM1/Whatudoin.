import admin from 'firebase-admin';

// Initialize Firebase Admin with credentials from env
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const messaging = admin.messaging();

async function sendNotifications() {
    console.log('Starting notification job...');

    try {
        // 1. Get all users
        const usersSnapshot = await db.collection('users').get();

        if (usersSnapshot.empty) {
            console.log('No users found.');
            return;
        }

        const messages = [];

        // 2. For each user, get their tokens
        for (const userDoc of usersSnapshot.docs) {
            const tokensSnapshot = await userDoc.ref.collection('tokens').get();

            if (tokensSnapshot.empty) continue;

            const tokens = tokensSnapshot.docs.map(doc => doc.data().token);

            // Deduplicate tokens
            const uniqueTokens = [...new Set(tokens)];

            // Create a message for each token
            // Note: Ideally we'd use multicast, but for simplicity we'll just push to array
            // Multicast is better for batch sending:
            if (uniqueTokens.length > 0) {
                messages.push({
                    notification: {
                        title: 'Hour Journal',
                        body: 'What did you do last hour?',
                    },
                    tokens: uniqueTokens,
                    webpush: {
                        fcm_options: {
                            link: 'https://your-app-url.com' // Should be env var or configured
                        }
                    }
                });
            }
        }

        // 3. Send all messages
        // Admin SDK supports multicast
        for (const msg of messages) {
            try {
                const response = await messaging.sendMulticast(msg);
                console.log(`Sent ${response.successCount} messages, failed ${response.failureCount}`);
                if (response.failureCount > 0) {
                    response.responses.forEach((resp, idx) => {
                        if (!resp.success) {
                            console.error(`Failure sending to token`, resp.error);
                            // Cleanup invalid tokens logic could go here
                        }
                    });
                }
            } catch (err) {
                console.error('Error sending batch:', err);
            }
        }

        console.log('Notification job complete.');

    } catch (error) {
        console.error('Error in notification job:', error);
        process.exit(1);
    }
}

sendNotifications();
