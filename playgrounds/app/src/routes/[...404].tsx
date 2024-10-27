import { A } from "@solidjs/router";

export default function NotFound() {
  return (
    <main class="text-center mx-auto text-gray-700 p-4">
      <h1 class="max-6-xs text-6xl text-sky-700 font-thin uppercase my-16">404: Page Not Found</h1>
      <p class="mt-8">
        Didn't find what you were looking?
        <img src="../../public/404-gif-468x328.gif" alt="404: Page Not Found (Confused Tarvolta)" class="mx-auto my-4" />
        You might want to visit the {" "}
        <A href="/about" class="text-sky-600 hover:underline">
          About Page
        </A>{" "}
        or get more details on 
        <A href="/about" class="text-sky-600 hover:underline">
          GitHub
        </A>{" "}
      </p>
    </main>
  );
}
