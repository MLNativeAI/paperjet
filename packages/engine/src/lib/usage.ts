// const cache = new Map<string, UsagePrice>();
//
// type UsagePrice = {
//   inputCost: number;
//   outputCost: number;
// };
//
// async function getModelPrice(model: string): Promise<UsagePrice | null> {
//   if (cache.has(model)) {
//     return cache.get(model) ?? null;
//   }
//
//   const modelPrices = await getUsagePrices({ model: model });
//
//   if (modelPrices.length > 0 && modelPrices[0]) {
//     const usagePrice = {
//       inputCost: Number(modelPrices[0].inputCostPerMillionTokens),
//       outputCost: Number(modelPrices[0].outputCostPerMillionTokens),
//     };
//
//     cache.set(model, usagePrice);
//     return usagePrice;
//   }
//
//   return null;
// }
//
// const calculateCost = (
//   usagePrice: UsagePrice,
//   usage: LanguageModelUsage,
// ): {
//   inputCost: number;
//   outputCost: number;
//   totalCost: number;
// } => {
//   const inputCost = (usagePrice.inputCost * usage.promptTokens) / 1000000;
//   const outputCost = (usagePrice.outputCost * usage.completionTokens) / 1000000;
//   return {
//     inputCost,
//     outputCost,
//     totalCost: inputCost + outputCost,
//   };
// };
//
// export async function trackUsage(name: string, model: string, usage: LanguageModelUsage, durationMs?: number) {
//   const modelPrice = await getModelPrice(model);
//   const inputCost = usage.promptTokens && modelPrice ? calculateCost(modelPrice, usage).inputCost : 0;
//   const outputCost = usage.completionTokens && modelPrice ? calculateCost(modelPrice, usage).outputCost : 0;
//   const totalCost = inputCost + outputCost;
//   await insertUsage({ name, model, usage, inputCost, outputCost, totalCost, durationMs });
// }
