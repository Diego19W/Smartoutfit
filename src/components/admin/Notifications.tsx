// TODO: Conectar con base de datos para notificaciones
// Estructura de datos:
// - id: number
// - type: 'warning' | 'info' | 'success' | 'order'
// - title: string
// - message: string
// - time: string
// - read: boolean

export function Notifications() {
  return (
    <div>
      <div className="mb-8">
        <h3 className="tracking-wider mb-1">NOTIFICACIONES</h3>
        <p className="text-sm opacity-60">
          Conecta tu base de datos para ver notificaciones
        </p>
      </div>

      {/* Empty State */}
      <div className="bg-white border border-black/10 p-12 text-center">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>
          <h4 className="tracking-wider mb-2">NO HAY NOTIFICACIONES</h4>
          <p className="text-sm opacity-60">
            Las notificaciones aparecerán aquí cuando conectes tu base de datos.
          </p>
        </div>
      </div>
    </div>
  );
}
