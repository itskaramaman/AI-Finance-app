const serializeObject = (obj) => {
  const serialized = { ...obj };

  if (obj.balance) {
    serialized.balance = obj.balance.toNumber();
  }

  if (obj.amount) {
    serialized.balance = obj.balance.toNumber();
  }

  return serialized;
};

export default serializeObject;
