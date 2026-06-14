import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { type FC, type PropsWithChildren } from "react"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
})

export const Providers: FC<PropsWithChildren> = (props) => {
  const { children } = props

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
