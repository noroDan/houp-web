/* Descargables: envía el formulario a la función houp-leads y muestra la confirmación. */
(function () {
  'use strict';
  var URL_FN = 'https://rrrxtwojegpjnrezzedq.supabase.co/functions/v1/houp-leads';
  var MSG = { datos: 'Complete nombre, correo y organización.', correo: 'Revise su correo.', aviso: 'Falta aceptar el aviso de privacidad.', envio: 'No pudimos enviar el correo. Intente de nuevo en unos minutos o escríbanos por WhatsApp.' };
  document.querySelectorAll('.descarga-form').forEach(function (f) {
    var estado = f.querySelector('.descarga-estado'), btn = f.querySelector('button[type=submit]');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = { recurso: f.dataset.recurso, nombre: f.nombre.value.trim(), correo: f.correo.value.trim(), organizacion: f.organizacion.value.trim(), sitio_web: f.sitio_web.value, aviso: f.aviso.checked, origen: location.pathname + location.search };
      if (!d.nombre || !d.organizacion || !d.correo) { estado.textContent = MSG.datos; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.correo)) { estado.textContent = MSG.correo; return; }
      if (!d.aviso) { estado.textContent = MSG.aviso; return; }
      estado.textContent = ''; btn.disabled = true;
      fetch(URL_FN, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok && j.ok, error: j.error }; }); })
        .then(function (r) {
          if (!r.ok) { estado.textContent = MSG[r.error] || MSG.envio; btn.disabled = false; return; }
          var listo = f.parentNode.querySelector('.descarga-listo');
          listo.querySelector('.descarga-correo').textContent = d.correo;
          f.hidden = true; listo.hidden = false;
          var p = { recurso: d.recurso, rama: d.recurso === 'guia' ? 'educacion' : 'fundacion' };
          if (typeof window.gtag === 'function') { try { window.gtag('event', 'descarga_submit', p); } catch (x) {} }
          if (typeof window.fbq === 'function') { try { window.fbq('track', 'Lead', { content_name: d.recurso }); } catch (x) {} }
        })
        .catch(function () { estado.textContent = MSG.envio; btn.disabled = false; });
    });
  });
})();
