import { useEffect, useRef, useState } from 'react';
import { api } from '../services/api';
import { compressImageFile } from '../utils/compressImageFile';

const MAX_PHOTOS = 6;

export default function useProfilePhotos(user, onUpdated, onShowToast) {
  const [fotos, setFotos] = useState(() => user?.fotos || []);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const locked = useRef(true);
  const generation = useRef(0);
  const callbacks = useRef({ onUpdated, onShowToast });
  callbacks.current = { onUpdated, onShowToast };
  const userId = user?.id;

  const publish = (list) => {
    const ordered = [...list].sort((a, b) => a.orden - b.orden);
    setFotos(ordered);
    callbacks.current.onUpdated?.(userId, ordered);
  };

  useEffect(() => {
    const request = ++generation.current;
    locked.current = true;
    setLoading(true);
    setError('');
    setFotos(user?.fotos || []);
    if (!userId) { locked.current = false; setLoading(false); return; }
    api.getFotos(userId)
      .then((list) => { if (request === generation.current) publish(list); })
      .catch((error) => {
        if (request === generation.current) {
          const message = error.message || 'No se pudieron cargar las fotos';
          setError(message);
          callbacks.current.onShowToast?.(message, 'error');
        }
      })
      .finally(() => {
        if (request === generation.current) { locked.current = false; setLoading(false); }
      });
    return () => { generation.current++; };
  }, [userId]);

  const run = async (action, message) => {
    if (locked.current || !userId) return false;
    locked.current = true;
    setLoading(true);
    setError('');
    const request = generation.current;
    try {
      await action();
      const list = await api.getFotos(userId);
      if (request !== generation.current) return false;
      publish(list);
      callbacks.current.onShowToast?.(message, 'success');
      return true;
    } catch (error) {
      if (request === generation.current) {
        const message = error.message || 'No se pudieron guardar las fotos';
        setError(message);
        callbacks.current.onShowToast?.(message, 'error');
      }
      return false;
    } finally {
      if (request === generation.current) { locked.current = false; setLoading(false); }
    }
  };

  const checkCapacity = () => {
    if (fotos.length < MAX_PHOTOS) return true;
    callbacks.current.onShowToast?.('Podés tener hasta 6 fotos en tu perfil.', 'warning');
    return false;
  };

  return {
    fotos,
    loading,
    error,
    addFiles: (files) => {
      if (!files.length || !checkCapacity()) return Promise.resolve(false);
      return run(async () => {
        const selected = Array.from(files).slice(0, MAX_PHOTOS - fotos.length);
        const urls = await Promise.all(selected.map(compressImageFile));
        await api.agregarFoto(userId, { fotos: urls.map((url) => ({ url })) });
      }, 'Fotos agregadas al perfil');
    },
    addUrl: (url) => {
      if (!url || !checkCapacity()) return Promise.resolve(false);
      return run(() => api.agregarFoto(userId, { url }), 'Foto agregada al perfil');
    },
    remove: (foto) => run(() => api.eliminarFoto(userId, foto.id), 'Foto eliminada'),
    makeMain: (foto) => run(() => api.marcarFotoPrincipal(userId, foto.id), 'Foto principal actualizada'),
    move: (index, direction) => {
      const target = index + direction;
      if (target < 0 || target >= fotos.length) return Promise.resolve(false);
      const ordered = [...fotos];
      [ordered[index], ordered[target]] = [ordered[target], ordered[index]];
      return run(() => api.reordenarFotos(userId, ordered.map((foto) => foto.id)), 'Orden actualizado');
    },
  };
}
