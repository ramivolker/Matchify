const ubicacionService = require("../services/ubicacion.service");

const crear = async (req, res) => {
  try {
    const ubicacion = await ubicacionService.crear(req.body);

    res.status(201).json(ubicacion);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerTodas = async (req, res) => {
  try {
    const ubicaciones = await ubicacionService.obtenerTodas();

    res.status(200).json(ubicaciones);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const obtenerPorId = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ubicacion = await ubicacionService.obtenerPorId(id);

    res.status(200).json(ubicacion);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const actualizar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const ubicacion = await ubicacionService.actualizar(id, req.body);

    res.status(200).json(ubicacion);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

const eliminar = async (req, res) => {
  try {
    const id = Number(req.params.id);
    await ubicacionService.eliminar(id);

    res.status(204).send();
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  crear,
  obtenerTodas,
  obtenerPorId,
  actualizar,
  eliminar,
};