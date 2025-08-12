module.exports = (req, res) => {
  // Devuelve un arreglo de objetos con los valores de taskId a prerenderizar
  const taskIds = ['123', '456', '789']; // Reemplaza con valores reales de taskId desde tu backend
  return taskIds.map(taskId => ({ taskId }));
};
