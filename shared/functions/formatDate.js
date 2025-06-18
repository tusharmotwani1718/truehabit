function formatDate(isoDateStr) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    const date = new Date(isoDateStr);
    return date.toLocaleDateString(undefined, options); // Uses user's locale
  }

  
  export default formatDate;