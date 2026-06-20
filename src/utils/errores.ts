export function extraerMensajeError(err: unknown, fallback: string): string {
  const axiosErr = err as { response?: { data?: { mensaje?: string } } };
  return axiosErr.response?.data?.mensaje ?? fallback;
}
