import { component$ } from "@builder.io/qwik";
import {
  Form,
  type RequestEventAction,
  routeAction$,
  type DocumentHead,
  routeLoader$,
} from "@builder.io/qwik-city";
import GithubHelper from "~/helpers/github/util";

interface recommendation {
  id: string;
}

interface metaData {
  id: string;
  title: string;
  author: string;
  publishDate: string;
  recommendations: recommendation[];
  readtime: string;
  tags: string[];
  excerpt: string;
}

export const useAction = routeAction$(
  async (data: any, requestEvent: RequestEventAction) => {
    const formData = requestEvent.sharedMap.get("@actionFormData");
    const file = await formData.get("markdown").arrayBuffer();
    const fileData = Buffer.from(file).toString("utf-8");
    const message = `added blog about ${data.title}`;
    const rec: recommendation[] = []
    if (data.recommendations_1) {
      rec.push({ id: data.recommendations_1 });
    }
    if (data.recommendations_2) {
      rec.push({ id: data.recommendations_2 });
    }
    if (data.recommendations_3) {
      rec.push({ id: data.recommendations_3 });
    }
    const tags: string[] = []
    if (data.tags_1) {
      tags.push(data.tags_1);
    }
    if (data.tags_2) {
      tags.push(data.tags_2);
    }
    if (data.tags_3) {
      tags.push(data.tags_3);
    }
    const jsonData: metaData = {
      id: String(data.title).split(' ').join('-').toLowerCase(),
      title: data.title,
      author: data.author,
      publishDate: data.publishDate,
      recommendations: rec,
      readtime: data.readtime,
      tags: tags,
      excerpt: data.excerpt,
    };

    const accessToken = requestEvent.sharedMap.get("session")?.accessToken;
    const commit = await GithubHelper({
      accessToken: accessToken,
      content: fileData,
      message: message,
      filename: `${data.title}`,
      json: JSON.stringify(jsonData),
    });
    if (!commit.success) {
      return { success: false, error: "No file selected" };
    }
    return { success: true };
  },
);

export const useRecfetch = routeLoader$(async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/siddoinghisjob/blog-code/refs/heads/main/data/blog.json",
  );
  const recs = await res.json();
  if (!recs || !recs.blogs) {
    return { success: false, error: "No file selected" };
  }
  const recs_list = recs.blogs.map((rec: any) => {
    return { id: rec.id };
  });
  return { success: true, message: recs_list };
});

export default component$(() => {
  const action = useAction();
  const rec_list = useRecfetch();
  return (
    <div class="perspective-1000 flex h-full min-h-screen w-full flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-10 align-middle">
      <h1 class="shadow-text mb-8 rotate-x-10 transform text-4xl font-bold tracking-tight text-white">
        Writer Backend
      </h1>
      <Form
        action={action}
        enctype="multipart/form-data"
        class="flex w-full max-w-3xl rotate-x-5 transform flex-col gap-4 rounded-2xl border border-white/20 bg-white/10 p-10 shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] backdrop-blur-md"
      >
        <label for="title" class="font-medium text-white">
          Title
        </label>
        <input
          type="text"
          name="title"
          class="w-full transform rounded-lg border-0 bg-white/5 p-3 text-white shadow-inner transition-all hover:translate-y-[-2px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <label for="author" class="font-medium text-white">
          Author
        </label>
        <input
          type="text"
          name="author"
          class="w-full transform rounded-lg border-0 bg-white/5 p-3 text-white shadow-inner transition-all hover:translate-y-[-2px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <label for="recommendations" class="font-medium text-white">
          Recommendations
        </label>
        <div class="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((num, key) => (
            <select
              key={key}
              name={`recommendations_${num}`}
              class="transform rounded-lg border-0 bg-white/5 p-3 text-white shadow-inner transition-all hover:translate-y-[-2px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
            >
              {rec_list.value.message?.map((rec: recommendation) => (
                <option
                  key={rec.id}
                  value={rec.id}
                  class="bg-slate-800 text-white"
                >
                  {rec.id}
                </option>
              ))}
            </select>
          ))}
        </div>

        <label for="publishDate" class="font-medium text-white">
          Publish Date
        </label>
        <input
          type="date"
          name="publishDate"
          class="w-full transform rounded-lg border-0 bg-white/5 p-3 text-white shadow-inner transition-all hover:translate-y-[-2px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <label for="readtime" class="font-medium text-white">
          Read Time
        </label>
        <input
          type="text"
          name="readtime"
          class="w-full transform rounded-lg border-0 bg-white/5 p-3 text-white shadow-inner transition-all hover:translate-y-[-2px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <label for="tags" class="font-medium text-white">
          Tags
        </label>
        <div class="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((num, key) => (
            <input
              key={key}
              name={`tags_${num}`}
              class="transform rounded-lg border-0 bg-white/5 p-3 text-white shadow-inner transition-all hover:translate-y-[-2px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
            />
          ))}
        </div>

        <label for="excerpt" class="font-medium text-white">
          Excerpt
        </label>
        <textarea
          name="excerpt"
          rows={3}
          class="w-full transform rounded-lg border-0 bg-white/5 p-3 text-white shadow-inner transition-all hover:translate-y-[-2px] focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <label for="markdown" class="font-medium text-white">
          Markdown
        </label>
        <div class="relative overflow-hidden rounded-lg border border-white/20 bg-white/5 p-3">
          <div class="flex items-center justify-between">
            <span class="file-name text-white text-opacity-70">No file selected</span>
            <button type="button" class="px-4 py-2 rounded-lg bg-blue-500 text-white text-sm">
              Browse Files
            </button>
          </div>
          <input
            type="file"
            name="markdown"
            id="markdown"
            class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            onChange$={(e: any) => {
              const fileName = e.target.files?.[0]?.name || 'No file selected';
              const fileNameDisplay = document.querySelector('.file-name');
              if (fileNameDisplay) {
                fileNameDisplay.textContent = fileName;
              }
            }}
          />
        </div>

        <button
          type="submit"
          class="mt-4 w-full transform rounded-lg border-0 bg-gradient-to-r from-blue-500 to-indigo-600 p-4 font-medium text-white shadow-lg shadow-blue-500/30 transition-all hover:translate-y-[-4px] hover:shadow-xl hover:shadow-blue-500/40"
        >
          Submit
        </button>

        {action.value?.error && (
          <p class="rounded-lg bg-red-400/10 p-2 text-center font-medium text-red-400">
            {action.value.error}
          </p>
        )}
        {action.value?.success && (
          <div class="flex items-center justify-center rounded-lg bg-green-400/10 p-4 text-center font-medium text-green-400">
            <svg
              class="mr-2 h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
            File uploaded successfully
          </div>
        )}
      </Form>
    </div>
  );
});

export const head: DocumentHead = {
  title: "Writer Backend",
  meta: [
    {
      name: "description",
      content: "Backend to upload md and json files to the portfolio app",
    },
  ],
};
