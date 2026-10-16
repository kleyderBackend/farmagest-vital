const transitions = {
  pending: ["preparing", "cancelled"], preparing: ["on_the_way", "cancelled"],
  on_the_way: ["delivered", "cancelled"], delivered: [], cancelled: [],
};

export function configureStatusSelect(select, value) {
  if (!select) return;
  const status = value === "processing" ? "preparing" : value === "completed" ? "delivered" : value;
  for (const option of select.options) {
    option.disabled = option.value !== status && !(transitions[status] || []).includes(option.value);
  }
  select.value = status;
  select.disabled = !transitions[status]?.length;
}
