export const paginatedQuery = async (model: any, params: any) => {
  let items: any[] = [];
  let nextToken = null;

  do {
    const { data, errors, nextToken: newToken } = await model.list({
      ...params,
      nextToken,
      limit: params.limit || 1000
    }) as any;

    if (errors) throw new Error(JSON.stringify(errors));
    items = items.concat(data);
    nextToken = newToken;
  } while (nextToken);

  return items;
};