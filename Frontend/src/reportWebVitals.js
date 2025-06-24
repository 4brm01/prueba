const reportWebVitals = onPerfEntry => {
  // Simplified version without web-vitals dependency
  if (onPerfEntry && onPerfEntry instanceof Function) {
    // Basic performance logging
    console.log('Performance monitoring disabled - web-vitals removed for lighter build');
  }
};

export default reportWebVitals;
