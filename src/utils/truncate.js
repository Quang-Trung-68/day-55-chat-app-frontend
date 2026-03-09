const truncate = (str, max = 20) => {
  if (!str) return "";
  return str.length > max ? str.slice(0, max) + "..." : str;
};

export default truncate;
