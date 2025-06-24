// Polyfill para manejar la advertencia de MouseEvent.mozInputSource
// Reemplaza mozInputSource con pointerType cuando sea posible

if (typeof window !== 'undefined') {
  // Interceptar la propiedad mozInputSource y redirigirla a pointerType
  const originalMouseEventDescriptor = Object.getOwnPropertyDescriptor(MouseEvent.prototype, 'mozInputSource');
  
  if (originalMouseEventDescriptor) {
    Object.defineProperty(MouseEvent.prototype, 'mozInputSource', {
      get: function() {
        // Si es un PointerEvent y tiene pointerType, usamos eso
        if (this instanceof PointerEvent && this.pointerType) {
          console.warn('MouseEvent.mozInputSource is deprecated. Use PointerEvent.pointerType instead.');
          return this.pointerType === 'mouse' ? 1 : 0;
        }
        
        // Si el descriptor original existe, usamos eso
        if (originalMouseEventDescriptor && originalMouseEventDescriptor.get) {
          return originalMouseEventDescriptor.get.call(this);
        }
        
        // Valor por defecto
        return 1; // 1 es el valor para mouse en mozInputSource
      },
      configurable: true,
      enumerable: true
    });
  }
}

// Crear un objeto para exportar
const polyfills = {};

export default polyfills;