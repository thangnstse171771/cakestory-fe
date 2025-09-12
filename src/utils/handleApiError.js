export function handleApiError(err, navigate) {
  const status = err?.response?.status || err?.status;
  if (status === 403) {
    navigate("/403", { replace: true });
    return { redirected: true, status };
  }
  if (status === 404) {
    navigate("/404", { replace: true });
    return { redirected: true, status };
  }
  return { redirected: false, status };
}
