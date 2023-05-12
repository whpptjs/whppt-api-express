import { layout } from './layout';
import { buildOrderForDisplay } from '../helpers/buildOrderForDisplay';

function getOrderItems(order: any) {
  if (order.items?.length) {
    let itemsHtml = '';
    const items = order.items;

    for (let item of items) {
      itemsHtml +=
        '<tr><td style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        item.quantity.toString() +
        '</td><td style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        (item?.product?.name || 'Legacy Item') +
        '</td><td style="color:#ffffff;font-weight:500;font-size:14px;font-family:sweet-sans-pro, Arial, Helvetica, sans-serif;">' +
        '&nbsp;&nbsp;$' +
        ((item.purchasedPrice || item?.product?.price) / 100).toFixed(2).toString() +
        '</td></tr>';
    }

    return itemsHtml;
  }
}

function getItemDiscounts(_discount: string | number) {
  return /* HTML */ `
    <tr>
      <th style=${getRowStyle()} scope="row" colspan="2">Item/s Discount</th>
      <td style=${getRowStyle()}>- $${_discount}</td>
    </tr>
  `;
}

function getDiscountApplied(_discount: string | number) {
  return /* HTML */ `
    <tr>
      <th style=${getRowStyle()} scope="row" colspan="2">Order discount</th>
      <td style=${getRowStyle()}>- $${_discount}</td>
    </tr>
  `;
}
function getMemberDiscount(_discount: string | number) {
  return /* HTML */ `
    <tr>
      <th style=${getRowStyle()} scope="row" colspan="2">Member discount</th>
      <td style=${getRowStyle()}>- $${_discount}</td>
    </tr>
  `;
}

function getRowStyle() {
  return 'color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;';
}

export function getOrderTemplate(order: any, domainId?: string) {
  const {
    total,
    subtotal,
    itemsDiscountedAmount,
    totalDiscountedFromTotal,
    membersDiscount,
    tax,
    shipping,
  } = buildOrderForDisplay(order);

  const invoiceUrl = domainId
    ? `https://www.hentleyfarm.com.au/api/pdf/orderReceipt?orderId=${order._id}&domainId=${domainId}`
    : '';

  const invoice = invoiceUrl
    ? `<a
            href=${invoiceUrl}
            style="color:#ffffff;font-weight:300;font-size:14px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
            View Online Invoice<br />
          </a>`
    : '';

  const template = /* HTML */ `
    <table
      border="0"
      cellpadding="0"
      cellspacing="0"
      width="650"
      style="background-color: #242424">
      <tr>
        <td valign="top" style="padding: 35px;">
          <h2
            style="color:#ffffff;font-weight:500;font-size:24px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
            Order Confirmation<br />
          </h2>
          <h2
            style="color:#ffffff;font-weight:500;font-size:24px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:10px">
            Order #${order.orderNumber || order._id},<br />
          </h2>
          <p
            style="color:#ACACAC;font-weight:normal;font-size:16px;font-family:Roxborough, Arial, Helvetica, sans-serif;margin-bottom:30px">
            ${order.updatedAt &&
            new Date(order.updatedAt).toLocaleDateString('en-US', {
              weekday: 'long',
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </p>
          <table
            cellspacing="0"
            cellpadding="6"
            style="width: 100%; border: 1px solid #937a4a;"
            border="1"
            bordercolor="#937a4a">
            <thead>
              <tr>
                <th
                  scope="col"
                  style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
                  Product
                </th>
                <th
                  scope="col"
                  style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
                  Quantity
                </th>
                <th
                  scope="col"
                  style="color:#ffffff;font-weight:500;text-align:left; border: 1px solid #937a4a;">
                  Price
                </th>
              </tr>
            </thead>
            <tbody>
              ${getOrderItems(order)}
            </tbody>
            <tfoot style="background-color: #242424">
              ${itemsDiscountedAmount ? getItemDiscounts(itemsDiscountedAmount) : ''}
              <tr>
                <th style=${getRowStyle()} scope="row" colspan="2">Subtotal</th>
                <td style=${getRowStyle()}>&nbsp;&nbsp;$${subtotal}</td>
              </tr>
              ${totalDiscountedFromTotal
                ? getDiscountApplied(totalDiscountedFromTotal)
                : ''}
              ${membersDiscount ? getMemberDiscount(membersDiscount) : ''}
              <tr>
                <th style=${getRowStyle()} scope="row" colspan="2">Shipping</th>
                <td style=${getRowStyle()}>&nbsp;&nbsp;${shipping}</td>
              </tr>
              <tr>
                <th scope="row" colspan="2" style=${getRowStyle()}>
                  Total - (Tax incl. $${tax})
                </th>
                <td style=${getRowStyle()}>&nbsp;&nbsp;$${total}</td>
              </tr>
            </tfoot>
          </table>
          ${invoice}
        </td>
      </tr>
    </table>
  `;

  return layout(template, 'hentleyfarm.com/member/purchases');
}
