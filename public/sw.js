/* UAQ Family Connect - Web Push Service Worker
   Safe Step 2: receives push notifications when push is enabled later.
   This file does not request permission and does not send anything by itself.
*/

self.addEventListener('push', (event) => {
  let payload = {}

  try {
    payload = event.data
      ? event.data.json()
      : {}
  } catch {
    payload = {
      title: 'UAQ Family Connect',
      body: event.data
        ? event.data.text()
        : 'There is a new update from UAQ.',
    }
  }

  const title =
    payload.title ||
    'UAQ Family Connect'

  const options = {
    body:
      payload.body ||
      'There is a new update from UAQ.',
    icon:
      payload.icon ||
      '/icon-192.png',
    badge:
      payload.badge ||
      '/icon-192.png',
    tag:
      payload.tag ||
      'uaq-family-update',
    renotify: true,
    data: {
      url:
        payload.url ||
        '/',
      ...(payload.data || {}),
    },
  }

  event.waitUntil(
    self.registration.showNotification(
      title,
      options
    )
  )
})

self.addEventListener(
  'notificationclick',
  (event) => {
    event.notification.close()

    const targetUrl =
      event.notification?.data?.url ||
      '/'

    event.waitUntil(
      clients
        .matchAll({
          type: 'window',
          includeUncontrolled: true,
        })
        .then(
          async (clientList) => {
            for (
              const client of
              clientList
            ) {
              try {
                const clientUrl =
                  new URL(
                    client.url
                  )

                const target =
                  new URL(
                    targetUrl,
                    self.location.origin
                  )

                if (
                  clientUrl.origin ===
                  target.origin
                ) {
                  await client.focus()

                  if (
                    'navigate' in
                    client
                  ) {
                    await client.navigate(
                      target.href
                    )
                  }

                  return
                }
              } catch {
                // Continue to the next open client.
              }
            }

            if (
              clients.openWindow
            ) {
              return clients.openWindow(
                targetUrl
              )
            }

            return undefined
          }
        )
    )
  }
)