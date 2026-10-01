export const matchToProfile = (match, usuarioId, usuarios) => {
  const other = match.otroUsuario ?? (match.usuario1Id === usuarioId ? match.usuario2 : match.usuario1);
  return { ...usuarios.find((u) => u.id === other.id), ...other,
    matchId: match.id, fechaMatch: match.fecha,
    ultimoMensaje: match.ultimoMensaje ?? null, noLeidos: match.noLeidos ?? 0 };
};
