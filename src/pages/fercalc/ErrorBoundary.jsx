import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    // El estado inicial: por defecto, no hay ningún error.
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  // Este método estático se llama cuando un componente hijo lanza un error.
  // Su única responsabilidad es actualizar el estado para que el siguiente
  // renderizado muestre la interfaz de respaldo.
  static getDerivedStateFromError(error) {
    // Actualiza el estado para indicar que ha ocurrido un error.
    return { hasError: true };
  }

  // Este método se llama después de que se captura el error.
  // Es el lugar perfecto para registrar el error en servicios externos
  // o simplemente en la consola para depuración.
  componentDidCatch(error, errorInfo) {
    // Aquí puedes registrar el error en un servicio de monitoreo.
    // Por ahora, lo mostraremos en la consola.
    console.error("Error capturado por ErrorBoundary:", error, errorInfo);
    
    // También guardamos la información para mostrarla si estamos en desarrollo
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    // Si el estado indica que hay un error...
    if (this.state.hasError) {
      // Muestra la interfaz de respaldo (fallback).
      // Puedes pasar una UI personalizada a través de props con <ErrorBoundary fallback={...}>
      // Si no, muestra una por defecto.
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Fallback por defecto si no se proporciona uno
      return (
        <div 
          className="p-4 m-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded-md" 
          role="alert"
        >
          <h3 className="font-bold text-lg">Algo salió mal.</h3>
          <p>Se ha producido un error en esta sección de la aplicación.</p>
          
          {/* Es una buena práctica mostrar más detalles solo en el entorno de desarrollo */}
          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <details className="mt-4 text-sm">
              <summary className="cursor-pointer font-semibold">Detalles técnicos (solo para desarrolladores)</summary>
              <pre className="mt-2 p-2 bg-gray-100 rounded text-xs whitespace-pre-wrap overflow-auto">
                {this.state.error && this.state.error.toString()}
                <br />
                {this.state.errorInfo.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    // Si no hay ningún error, renderiza los componentes hijos normalmente.
    return this.props.children;
  }
}

export default ErrorBoundary;