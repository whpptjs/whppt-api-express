import { hentleyFarmLayout } from './html/hentleyFarm/Layout';
import { orderConfirmation } from './html/hentleyFarm/OrderConfirmation';

export function getOrderTemplate(order: any, domainId?: string) {
  return hentleyFarmLayout(orderConfirmation(order, domainId));
}

// import { layout } from './layout';
// import { buildOrderForDisplay } from '../helpers/buildOrderForDisplay';

// function getOrderItems(order: any) {
//   if (order.items?.length) {
//     let itemsHtml = '';
//     const items = order.items;

//     for (let item of items) {
//       itemsHtml +=
//         '<tr><td align="center" style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
//         (item?.productName || item?.product?.name || 'Legacy Item') +
//         '</td><td align="center" style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
//         (item?.product?.customFields.vintage || '') +
//         '</td><td align="center" style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
//         item.quantity.toString() +
//         '</td><td align="center" style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
//         '&nbsp;&nbsp;$' +
//         ((item.purchasedPrice || item?.product?.price) / 100).toFixed(2).toString() +
//         '</td></tr>';
//     }

//     return itemsHtml;
//   }
// }

// function getItemDiscounts(_discount: string | number) {
//   return /* HTML */ `
//     <tr>
//       <th style=${getRowStyle()} scope="row" colspan="3">Item/s Discount</th>
//       <td align="center" style=${getRowStyle()}>- $${_discount}</td>
//     </tr>
//   `;
// }

// function getDiscountApplied(_discount: string | number) {
//   return /* HTML */ `
//     <tr>
//       <th style=${getRowStyle()} scope="row" colspan="3">Order discount</th>
//       <td align="center" style=${getRowStyle()}>- $${_discount}</td>
//     </tr>
//   `;
// }
// function getMemberDiscount(_discount: string | number) {
//   return /* HTML */ `
//     <tr>
//       <th style=${getRowStyle()} scope="row" colspan="3">Member discount</th>
//       <td align="center" style=${getRowStyle()}>- $${_discount}</td>
//     </tr>
//   `;
// }

// function getRowStyle() {
//   return 'color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;';
// }

// export function getOrderTemplate(order: any, domainId?: string) {
//   const {
//     total,
//     subtotal,
//     itemsDiscountedAmount,
//     totalDiscountedFromTotal,
//     membersDiscount,
//     tax,
//     shipping,
//   } = buildOrderForDisplay(order);

//   const invoiceUrl = `https://www.hentleyfarm.com.au/api/pdf/orderReceipt?orderId=${
//     order._id
//   }&domainId=${domainId || 'vl8z483o6'}`;

//   const invoice = invoiceUrl
//     ? `<a
//             href=${invoiceUrl}
//             style="color:#ffffff;font-weight:300;font-size:14px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
//             View Online Invoice<br />
//           </a>`
//     : '';

//   const template = /* HTML */ `
//     <table
//       border="0"
//       cellpadding="0"
//       cellspacing="0"
//       width="650"
//       style="background-color: #242424">
//       <tr>
//         <td align="center" valign="top" style="padding: 35px;">
//           <h2
//             style="color:#ffffff;font-weight:500;font-size:24px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
//             Order Confirmation<br />
//           </h2>
//           <h2
//             style="color:#ffffff;font-weight:500;font-size:24px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
//             Order #${order.orderNumber || order._id},<br />
//           </h2>
//           <p
//             style="color:#ACACAC;font-weight:normal;font-size:16px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:30px">
//             ${order?.payment?.date &&
//             new Date(order?.payment?.date).toLocaleDateString('en-US', {
//               weekday: 'long',
//               day: 'numeric',
//               month: 'long',
//               year: 'numeric',
//             })}
//           </p>
//           <table
//             align="center"
//             cellspacing="0"
//             cellpadding="6"
//             style="width: 100%;border: 1px solid #937a4a;margin-bottom:10px"
//             border="1"
//             bordercolor="#937a4a">
//             <thead>
//               <tr>
//                 <th
//                   scope="col"
//                   style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
//                   Product
//                 </th>
//                 <th
//                   align="center"
//                   scope="col"
//                   style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
//                   Vintage
//                 </th>
//                 <th
//                   align="center"
//                   scope="col"
//                   style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
//                   Quantity
//                 </th>
//                 <th
//                   align="center"
//                   scope="col"
//                   style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
//                   Price
//                 </th>
//               </tr>
//             </thead>
//             <tbody>
//               ${getOrderItems(order)}
//             </tbody>
//             <tfoot style="background-color: #242424">
//               ${itemsDiscountedAmount ? getItemDiscounts(itemsDiscountedAmount) : ''}
//               ${totalDiscountedFromTotal
//                 ? getDiscountApplied(totalDiscountedFromTotal)
//                 : ''}
//               <tr>
//                 <th style=${getRowStyle()} scope="row" colspan="3">Subtotal</th>
//                 <td align="center" style=${getRowStyle()}>&nbsp;&nbsp;$${subtotal}</td>
//               </tr>
//               ${membersDiscount ? getMemberDiscount(membersDiscount) : ''}
//               <tr>
//                 <th style=${getRowStyle()} scope="row" colspan="3">Shipping</th>
//                 <td align="center" style=${getRowStyle()}>&nbsp;&nbsp;${shipping}</td>
//               </tr>
//               <tr>
//                 <th scope="row" colspan="3" style=${getRowStyle()}>
//                   Total - (Tax incl. $${tax})
//                 </th>
//                 <td align="center" style=${getRowStyle()}>&nbsp;&nbsp;$${total}</td>
//               </tr>
//             </tfoot>
//           </table>
//           ${invoice}
//         </td>
//       </tr>
//     </table>
//   `;

//   return layout(template, 'hentleyfarm.com/member/purchases');
// }
