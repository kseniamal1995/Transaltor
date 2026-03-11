import { clerkMiddleware } from "@clerk/nextjs/server";

// Все маршруты публичны — авторизация опциональна.
// Гостевые пользователи получают ID через GuestUserSync (localStorage).
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
