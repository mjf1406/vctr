import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { ConvexQueryClient } from "@convex-dev/react-query";
import { ConvexProvider, ConvexReactClient } from "convex/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme/theme-provider";
import i18n, { ensureLocaleLoaded, getInitialLanguage } from "@/i18n";
import { LanguageProvider } from "@/i18n/LanguageProvider";

// Import the generated route tree
import { routeTree } from "./routeTree.gen";
import { TooltipProvider } from "./components/ui/tooltip";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);
const convexQueryClient = new ConvexQueryClient(convex);
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryKeyHashFn: convexQueryClient.hashFn(),
      queryFn: convexQueryClient.queryFn(),
    },
  },
});
convexQueryClient.connect(queryClient);
// Create a new router instance
const router = createRouter({ routeTree });

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

async function bootstrap() {
  const bootLanguage = getInitialLanguage();
  await ensureLocaleLoaded(bootLanguage);
  await i18n.changeLanguage(bootLanguage);

  const rootElement = document.getElementById("root");
  if (!rootElement) {
    throw new Error("Root element #root not found");
  }
  if (!rootElement.innerHTML) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <ConvexProvider client={convex}>
        <QueryClientProvider client={queryClient}>
          <StrictMode>
            <LanguageProvider>
              <ThemeProvider defaultTheme="system" storageKey="vite-ui-theme">
                <div vaul-drawer-wrapper="" className="bg-background">
                  <TooltipProvider>
                    <RouterProvider router={router} />
                  </TooltipProvider>
                  <Toaster />
                </div>
              </ThemeProvider>
            </LanguageProvider>
          </StrictMode>
        </QueryClientProvider>
      </ConvexProvider>,
    );
  }
}

void bootstrap();
