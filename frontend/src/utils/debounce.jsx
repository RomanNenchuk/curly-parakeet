export default function debounce(func, delay) {
  let timeout;
  function debounced(...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  }
  debounced.cancel = () => {
    clearTimeout(timeout);
  };
  return debounced;
}
