import { useApp } from "@/context/AppContext";

export function useApiKey() {
  const { apiKey, setApiKeyValue, clearApiKey, setModalOpen } = useApp();
  return { apiKey, setApiKeyValue, clearApiKey, openApiKeyModal: () => setModalOpen(true) };
}
