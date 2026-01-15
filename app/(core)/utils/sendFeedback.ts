// app/(core)/utils/sendFeedback.ts
export const sendFeedbackToDiscord = async (rating: number, comment: string, path: string) => {
  const WEBHOOK_URL = process.env.NEXT_PUBLIC_DISCORD_WEBHOOK_URL_FEEDBACK || "";

  if (!WEBHOOK_URL) {
    console.error("Webhook Discord URL missing in env variables.");
    return false;
  }

  const message = {
    embeds: [{
      title: "🌟 New User Feedback",
      color: rating >= 4 ? 0x00ff00 : rating <= 2 ? 0xff0000 : 0xffff00,
      fields: [
        { name: "Rating", value: "⭐".repeat(rating), inline: true },
        { name: "Page", value: path, inline: true },
        { name: "Device", value: navigator.userAgent.split(') ')[0].split(' (')[1] || "Unknown", inline: true },
        { name: "Comment", value: `\`\`\`${comment || "No comment provided"}\`\`\`` }
      ],
      timestamp: new Date().toISOString()
    }]
  };

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(message)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    return true;
  } catch (error) {
    console.error("Error sending feedback:", error);
    return false;
  }
};