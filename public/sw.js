self.addEventListener("push", (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (error) {
    data = {
      title: "UAQ Family Connect",
      body: event.data
        ? event.data.text()
        : "You have a new notification.",
    };
  }

  const title = data.title || "UAQ Family Connect";

  const options = {
    body: data.body || "You have a new update.",

    icon: "/android-chrome-192x192.png",
    badge: "/android-chrome-192x192.png",

    // Minta notification guna bunyi sistem jika device/browser benarkan
    silent: false,

    // Android biasanya support vibration pattern ini
    vibrate: [200, 100, 200],

    // Elakkan notification lama menindih secara pelik
    tag: data.tag || "uaq-family-connect",

    renotify: true,

    data: {
      url: data.url || "/",
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl =
    event.notification.data?.url || "/";

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if ("focus" in client) {
            client.navigate(targetUrl);
            return client.focus();
          }
        }

        if (clients.openWindow) {
          return clients.openWindow(targetUrl);
        }
      })
  );
});