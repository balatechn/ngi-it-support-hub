const SYSTEM_PROMPT = `You are the NGI Microsoft 365 App Assistant for National Group India.
You help employees use Microsoft 365 apps — Teams, OneDrive, SharePoint, Excel, Word, Outlook, PowerPoint, OneNote, Planner, and Forms.
Give clear, numbered step-by-step instructions. Be friendly, concise, and practical.
Format responses with markdown: use ## headings, numbered steps, - bullet lists, **bold** for key UI elements like buttons and menu items.
Only answer questions about using Microsoft 365 apps and related NGI workflows.
If the user has a technical IT problem (software broken, account locked, device issue), tell them to raise a support ticket at /tickets/new.
Keep responses under 400 words unless the task genuinely requires more steps.

MICROSOFT 365 APP KNOWLEDGE:

## Microsoft Teams
- Create meeting invite: Calendar tab → + New Meeting → fill Title, Required attendees, Date/time → Send
- Schedule channel meeting: Go to channel → Meet → Schedule a meeting
- Create a team: Teams tab → Join or create a team → Create team → choose type
- Add members to team: Open team → ··· → Add member → search by name or email
- Create a channel: Open team → ··· next to team name → Add channel → name it → Add
- Share screen in call: During call → Share icon (↑) → choose Window or Desktop
- Background blur/replace: Before joining meeting → Background effects → Blur or pick image
- Record a meeting: During call → ··· More → Start recording (saved to OneDrive/SharePoint)
- Pin a message: Hover over message → ··· → Pin
- @mention someone: Type @ then name to notify them in a chat or channel
- Create a poll: In chat/channel → + More options (···) → Forms → Poll
- Out-of-office status: Click profile picture → Set status message → include date range
- Mute/unmute: Ctrl+Shift+M shortcut during a call
- Transfer a call: During call → ··· → Transfer

## OneDrive
- Upload files: OneDrive.com → + New → Files upload OR drag and drop
- Share a file/folder: Right-click file → Share → enter email or copy link → set permissions (View/Edit)
- Set link expiry: Share → Anyone with link → Set expiration date
- Sync to desktop: onedrive.com → Sync button → installs OneDrive app; files appear in File Explorer
- Restore deleted file: Recycle Bin (left sidebar) → select file → Restore
- Version history: Right-click file → Version history → restore any saved version
- Stop sharing: Right-click file → Manage access → Remove access

## SharePoint
- Access team site: Teams channel → Files tab → Open in SharePoint
- Create a page: Site Contents → Site Pages → + New → Page
- Add a web part: Edit page → + icon → choose web part (Text, Image, File viewer, etc.)
- Share site: Settings gear → Site permissions → Share site

## Excel
- AutoSum: Select cell below a column → Alt + = shortcut
- Create a table: Select data range → Insert → Table → OK (enables filters & auto-expand)
- Pivot Table: Insert → PivotTable → choose range → drag fields into Rows/Values
- VLOOKUP: =VLOOKUP(lookup_value, table_array, col_index, FALSE)
- Conditional formatting: Home → Conditional Formatting → Highlight Cell Rules
- Freeze panes: View → Freeze Panes → Freeze Top Row (or first column)
- Filter data: Select header row → Data → Filter → click dropdown arrows
- Remove duplicates: Data → Remove Duplicates → choose columns
- Share Excel workbook: File → Share → enter email (real-time co-authoring in OneDrive/SharePoint)

## Word
- Track changes: Review → Track Changes → on (all edits get highlighted)
- Accept/reject changes: Review → Accept or Reject each change
- Mail merge: Mailings → Start Mail Merge → Letters → Select Recipients (Excel sheet) → Insert Merge Field → Finish & Merge
- Table of contents: Place cursor at top → References → Table of Contents → choose style
- Compare documents: Review → Compare → Compare → select original and revised
- PDF export: File → Export → Create PDF/XPS
- Check word count: Review → Word Count
- Styles: Home → Styles panel → apply Heading 1/2/3 for structure

## Outlook
- Create a rule: Home → Rules → Manage Rules & Alerts → New Rule
- Schedule send: Compose email → dropdown next to Send → Schedule send → pick date/time
- Out-of-office reply: File → Automatic Replies → Send automatic replies → set dates & message
- Recall an email: Sent Items → open email → ··· → Recall This Message (only works if recipient hasn't opened it)
- Focused Inbox: View → Show Focused Inbox (separates important from other email)
- Create a contact group: People → New Contact Group → Add Members

## PowerPoint
- Designer suggestions: Insert a slide with content → Design → Designer (right panel gives layout ideas)
- Presenter View: Slideshow → Presenter View (see notes + next slide while presenting)
- Export as video: File → Export → Create a Video → choose quality → Save
- Add closed captions: Slideshow → Always Use Subtitles → Language settings
- Morph transition: Copy a slide → on new slide change element position → Transitions → Morph

## Microsoft Forms
- Create a form: forms.office.com → + New Form → add questions
- Share form: Share → Copy link → choose Anyone or specific people
- View responses: Open form → Responses tab → view summary or open in Excel
- Add branching: Question → ··· → Add branching (skip to different section based on answer)

## Planner
- Create a plan: planner.microsoft.com → + New plan → name it (or create from Teams channel)
- Add task: + Add task → set title, due date, assignee
- Add checklist to task: Open task → Add an item under Checklist
- View by member: Board → Group by → Assigned to`;

export async function POST(req: Request) {
  const { messages } = await req.json() as { messages: Array<{ role: string; content: string }> };

  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const geminiContents = messages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:streamGenerateContent?alt=sse&key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: geminiContents,
            generationConfig: { maxOutputTokens: 1500, temperature: 0.4 },
          }),
        }
      );

      if (res.ok && res.body) {
        const encoder = new TextEncoder();
        const upstream = res.body.getReader();
        const decoder = new TextDecoder();

        const stream = new ReadableStream({
          async start(controller) {
            let buf = "";
            while (true) {
              const { done, value } = await upstream.read();
              if (done) break;
              buf += decoder.decode(value, { stream: true });
              const lines = buf.split("\n");
              buf = lines.pop() ?? "";
              for (const line of lines) {
                if (!line.startsWith("data: ")) continue;
                const raw = line.slice(6).trim();
                if (!raw || raw === "[DONE]") continue;
                try {
                  const json = JSON.parse(raw);
                  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                  if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                } catch { /* skip malformed chunks */ }
              }
            }
            // flush remainder
            if (buf.startsWith("data: ")) {
              const raw = buf.slice(6).trim();
              if (raw && raw !== "[DONE]") {
                try {
                  const json = JSON.parse(raw);
                  const text: string = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
                  if (text) controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
                } catch { /* ignore */ }
              }
            }
            controller.close();
          },
          cancel() { upstream.cancel(); },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
          },
        });
      }
    } catch (err) {
      console.error("Gemini API error:", err);
      /* fall through to mock */
    }
  }

  // ── Smart mock fallback (used when GEMINI_API_KEY is not set) ──
  await new Promise(r => setTimeout(r, 500 + Math.random() * 700));
  const mock = smartMock(messages);
  return Response.json(mock);
}

function smartMock(messages: Array<{ role: string; content: string }>) {
  const q = messages[messages.length - 1]?.content?.toLowerCase() ?? "";

  if (q.includes("meeting") || q.includes("invite") || (q.includes("teams") && q.includes("schedule"))) return MOCKS.teamsMeeting;
  if (q.includes("channel") || (q.includes("teams") && q.includes("create"))) return MOCKS.teamsChannel;
  if (q.includes("share") && (q.includes("onedrive") || q.includes("file") || q.includes("folder"))) return MOCKS.onedrive;
  if (q.includes("excel") || q.includes("spreadsheet") || q.includes("pivot") || q.includes("vlookup")) return MOCKS.excel;
  if (q.includes("word") || q.includes("document") || q.includes("mail merge") || q.includes("track changes")) return MOCKS.word;
  if (q.includes("powerpoint") || q.includes("presentation") || q.includes("slide")) return MOCKS.powerpoint;
  if (q.includes("outlook") || q.includes("email rule") || q.includes("out of office") || q.includes("recall")) return MOCKS.outlook;
  if (q.includes("forms") || q.includes("survey") || q.includes("poll")) return MOCKS.forms;
  if (q.includes("planner") || q.includes("task") || q.includes("plan")) return MOCKS.planner;
  if (q.includes("sharepoint") || q.includes("share point")) return MOCKS.sharepoint;

  return {
    content: `I can help you with any Microsoft 365 app!\n\n**I cover:**\n- **Teams** — meetings, channels, calls, sharing\n- **OneDrive** — upload, share, sync files\n- **Excel** — formulas, pivot tables, filters\n- **Word** — track changes, mail merge, styles\n- **Outlook** — rules, scheduling, out-of-office\n- **PowerPoint** — presenter view, design, export\n- **Forms & Planner** — surveys, tasks, projects\n\nWhat would you like to learn how to do?`,
    sources: [],
  };
}

const MOCKS: Record<string, { content: string; sources: string[] }> = {
  teamsMeeting: {
    content: `## How to Create a Meeting Invite in Teams\n\n1. Click the **Calendar** icon in the left sidebar\n2. Click **+ New Meeting** (top right)\n3. Enter a **Title** for the meeting\n4. Add attendees in the **Required** or **Optional** fields\n5. Set the **Date**, **Start time**, and **End time**\n6. Select the **Channel** if it's a team meeting (optional)\n7. Add a description or agenda in the details box\n8. Click **Send**\n\nAttendees will receive a calendar invite with the Teams meeting link automatically included.\n\n**Tip:** To make it a recurring meeting, click **Does not repeat** and choose Daily / Weekly / Monthly.`,
    sources: ["Teams Meeting Guide"],
  },
  teamsChannel: {
    content: `## How to Create a Channel in Teams\n\n1. In the left sidebar, find your **Team**\n2. Click **···** next to the team name\n3. Select **Add channel**\n4. Enter a **Channel name** and optional description\n5. Set Privacy: **Standard** (visible to all) or **Private** (invite only)\n6. Click **Add**\n\n## How to Create a New Team\n\n1. Click **Teams** in the left sidebar\n2. Click **Join or create a team** (bottom of list)\n3. Click **Create team**\n4. Choose **From scratch** or build from an existing group\n5. Set as **Private** or **Public**\n6. Name the team and click **Create**\n7. Add members by name or email`,
    sources: ["Teams Setup Guide"],
  },
  onedrive: {
    content: `## How to Share a File or Folder in OneDrive\n\n1. Go to **OneDrive** (onedrive.com or the OneDrive app)\n2. Right-click the file or folder you want to share\n3. Click **Share**\n4. **Option A — Send link:** enter the person's email, set permissions (Can edit / Can view), click **Send**\n5. **Option B — Copy link:** click **Copy link** and paste it in Teams/email\n\n### Set link permissions:\n- **Anyone with the link** — public access (use with caution)\n- **People in NGI** — internal only (recommended)\n- **Specific people** — most secure\n\n### Set an expiry date:\nIn the Share dialog → **Anyone with link** → **Set expiration date**\n\n**Tip:** To stop sharing, right-click the file → **Manage access** → remove individuals or disable the link.`,
    sources: ["OneDrive Sharing Guide"],
  },
  excel: {
    content: `## Common Excel How-Tos\n\n### Create a Pivot Table\n1. Click anywhere in your data\n2. **Insert** → **PivotTable** → **OK**\n3. Drag fields to **Rows**, **Columns**, **Values**\n\n### VLOOKUP formula\n\`=VLOOKUP(A2, Sheet2!A:C, 2, FALSE)\`\n- A2 = what you're looking up\n- Sheet2!A:C = the table to search\n- 2 = which column to return\n- FALSE = exact match\n\n### AutoSum a column\n- Click the cell below numbers → press **Alt + =**\n\n### Filter your data\n- Select headers → **Data** → **Filter** → click dropdown arrows\n\n### Freeze the top row\n- **View** → **Freeze Panes** → **Freeze Top Row**\n\n### Remove duplicates\n- Select data → **Data** → **Remove Duplicates** → choose columns`,
    sources: ["Excel How-To Guide"],
  },
  word: {
    content: `## Common Word How-Tos\n\n### Track Changes (for document review)\n1. **Review** tab → click **Track Changes** to turn on\n2. All edits appear in coloured markup\n3. Reviewer accepts/rejects each change: **Review** → **Accept** or **Reject**\n\n### Mail Merge (send personalised letters/emails)\n1. **Mailings** → **Start Mail Merge** → choose **Letters** or **Email Messages**\n2. **Select Recipients** → **Use an Existing List** → pick your Excel file\n3. Click **Insert Merge Field** to add Name, Email, etc.\n4. **Finish & Merge** → **Print Documents** or **Send Email Messages**\n\n### Export to PDF\n- **File** → **Export** → **Create PDF/XPS** → **Publish**\n\n### Table of Contents\n1. Apply **Heading 1 / 2 / 3** styles to your headings\n2. Place cursor at the top of the document\n3. **References** → **Table of Contents** → pick a style`,
    sources: ["Word How-To Guide"],
  },
  powerpoint: {
    content: `## Common PowerPoint How-Tos\n\n### Presenter View (see notes while presenting)\n1. Connect a second screen\n2. **Slideshow** → **Presenter View**\n3. Your audience sees the slide; you see notes + next slide\n\n### Get design suggestions\n1. Insert a slide with an image or text\n2. Go to **Design** → **Designer** (right panel)\n3. Click any suggested layout to apply it\n\n### Export as video\n1. **File** → **Export** → **Create a Video**\n2. Choose quality (Full HD 1080p recommended)\n3. Set seconds per slide → **Create Video**\n\n### Add live captions\n- **Slideshow** → **Always Use Subtitles** → select your language`,
    sources: ["PowerPoint Guide"],
  },
  outlook: {
    content: `## Common Outlook How-Tos\n\n### Set Out-of-Office reply\n1. **File** → **Automatic Replies**\n2. Select **Send automatic replies**\n3. Set date range and type your message\n4. Separate message for internal vs external (optional)\n\n### Create an email rule\n1. **Home** → **Rules** → **Manage Rules & Alerts** → **New Rule**\n2. Choose a trigger (e.g. from a specific sender)\n3. Choose action (move to folder, mark as read, forward)\n\n### Schedule an email to send later\n1. Compose your email\n2. Click the dropdown arrow next to **Send**\n3. Choose **Schedule send** → pick date and time\n\n### Recall an email\n1. Go to **Sent Items** → open the email\n2. Click **···** → **Recall This Message**\n⚠️ Only works if the recipient hasn't opened it yet`,
    sources: ["Outlook Guide"],
  },
  forms: {
    content: `## How to Create a Form or Survey (Microsoft Forms)\n\n1. Go to **forms.office.com** and sign in\n2. Click **+ New Form**\n3. Give it a title and optional description\n4. Click **+ Add new** to add questions:\n   - Choice, Text, Rating, Date, Ranking, etc.\n5. Mark questions as **Required** if needed\n\n### Share the form:\n- Click **Share** → copy the link → paste in Teams or email\n- Or click **Send and collect responses** to email it directly\n\n### View responses:\n- Open the form → **Responses** tab\n- See summary charts or click **Open in Excel** for raw data\n\n### Add branching logic:\n- Click **···** on a question → **Add branching**\n- Route respondents to different questions based on their answer`,
    sources: ["Microsoft Forms Guide"],
  },
  planner: {
    content: `## How to Use Microsoft Planner\n\n### Create a plan:\n1. Go to **planner.microsoft.com**\n2. Click **+ New plan** → name it → Create\n3. Or in **Teams** → channel → + tab → Planner\n\n### Add a task:\n1. Click **+ Add task** under any bucket\n2. Enter title → set **Due date** and **Assignee**\n3. Open the task to add checklist, attachments, labels\n\n### Organise with buckets:\n- Click **+ Add new bucket** to group tasks by category (e.g. To Do, In Progress, Done)\n\n### View by person:\n- At the top right, change **Group by** → **Assigned to**\n\n### Track progress:\n- Click **Charts** view to see completion status at a glance`,
    sources: ["Planner Guide"],
  },
  sharepoint: {
    content: `## How to Use SharePoint\n\n### Access your team site:\n- In Teams → open a channel → **Files** tab → **Open in SharePoint**\n- Or go to sharepoint.com and find your site\n\n### Upload files:\n- Click **+ New** → **File upload** or drag and drop files\n\n### Create a page:\n1. Click **+ New** → **Page**\n2. Choose a layout template\n3. Click **+** on the page to add web parts (Text, Image, Document library, etc.)\n4. Click **Publish** when done\n\n### Share the site with someone:\n- Settings gear (⚙) → **Site permissions** → **Share site**\n- Enter their email and choose Member or Visitor role`,
    sources: ["SharePoint Guide"],
  },
};
