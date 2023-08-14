/* eslint-disable prettier/prettier */
import { buildOrderForDisplay } from '../../../helpers/buildOrderForDisplay';

export const orderConfirmation = (order: any, domainId?: string) => {
  const invoiceUrl = `https://www.hentleyfarm.com.au/api/pdf/orderReceipt?orderId=${
    order._id
  }&domainId=${domainId || 'vl8z483o6'}`;
  return `
  <table width="100%" border="0" cellspacing="0" cellpadding="0" class="em_full_wrap" bgcolor="#ffffff" style="background-color:#ffffff; table-layout:fixed;">
   <tr>
    <td align="center" valign="top">
      <table align="center" width="650" border="0" cellspacing="0" cellpadding="0" bgcolor="#ffffff" class="em_main_table" style="width:650px; table-layout:fixed;">
        <tr>
          <td valign="top" align="center">
            <table width="650" border="0" cellspacing="0" cellpadding="0" style="width:650px;" class="em_wrapper">
              <tr>
                <td valign="top" height="507" background="https://ci4.googleusercontent.com/proxy/2gHF7TnqHwWZ648Xte8u0GOCSAVGtDM0aElpqKVNf6i_Yt_W-9DqQ97Y24CbrnX7Dj19RPKtTJXJOVUpGzzdxUGbHC3B_x1LlOSWS5zoWkdX8GmXFdbZb_u9OAGg_wWzkCEPiATpQ_RKcmKSKiFPT6UdBnFUZy4YAiSNfdG68ozw=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/57f02b34-4017-43c9-bac6-28c3b2a90a8d.jpg" bgcolor="#000000" style="height:507px; background-image:url(https://ci4.googleusercontent.com/proxy/2gHF7TnqHwWZ648Xte8u0GOCSAVGtDM0aElpqKVNf6i_Yt_W-9DqQ97Y24CbrnX7Dj19RPKtTJXJOVUpGzzdxUGbHC3B_x1LlOSWS5zoWkdX8GmXFdbZb_u9OAGg_wWzkCEPiATpQ_RKcmKSKiFPT6UdBnFUZy4YAiSNfdG68ozw=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/57f02b34-4017-43c9-bac6-28c3b2a90a8d.jpg);background-color: #000000; background-repeat:no-repeat;background-size:cover; background-position:center top;" ><!--[if gte mso 9]>
                  <v:image xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style=" border: 0;display: inline-block; width: 650px; height: 507px;" src="https://ci4.googleusercontent.com/proxy/2gHF7TnqHwWZ648Xte8u0GOCSAVGtDM0aElpqKVNf6i_Yt_W-9DqQ97Y24CbrnX7Dj19RPKtTJXJOVUpGzzdxUGbHC3B_x1LlOSWS5zoWkdX8GmXFdbZb_u9OAGg_wWzkCEPiATpQ_RKcmKSKiFPT6UdBnFUZy4YAiSNfdG68ozw=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/57f02b34-4017-43c9-bac6-28c3b2a90a8d.jpg" />
                  <v:rect xmlns:v="urn:schemas-microsoft-com:vml" fill="true" stroke="false" style=" border: 0;display: inline-block;position: absolute; width: 650px; height: 507px;">
                  <v:fill opacity="0%" color="#000000" />
                  <v:textbox inset="0,0,0,0">
                  <![endif]-->                 
                  <table align="center" width="650" border="0" cellspacing="0" cellpadding="0" style="width:650px;" class="em_wrapper">
                    <tr>
                      <td width="20" style="width:20px;" class="em_side15">&nbsp;</td>
                      <td valign="top" align="center"><table align="center" width="100%" border="0" cellspacing="0" cellpadding="0">
                          <tr>
                            <td height="13" style="height:13px;">&nbsp;</td>
                          </tr>
                          <tr>
                            <td valign="top" align="center"><a href="https://www.hentleyfarm.com.au/" target="_blank" style="text-decoration:none;color:#FFFFFF;"><img src="https://ci6.googleusercontent.com/proxy/XFHpY226S2m3I_QcLmYZHkotsDyoxSUef9wrN3GCfLkn_hILc54-R7LN84uVQGoU8xrSEVPWAnhtZE6NERHpJ0BTwIOGfaqc0UErsLyiixw1zUqT2ibbRt5CZX20RLkSYEvDLIj4LTTqdmaFbyMirG5ok-xgMlAOyr4UbcPx_k5D=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/dc32c4cd-756c-4a99-92f1-6f205108c0d4.png" width="113" alt="Hentley Farm" border="0" style="display:block;max-width:113px; font-family:Arial, Helvetica, sans-serif; font-size:15px; line-height:18px; color:#ffffff;"/></a></td>
                          </tr>
                          <tr>
                            <td height="10" style="height:10px;font-size:0px;line-height:0px;">&nbsp;</td>
                          </tr>
                        </table></td>
                      <td width="20" style="width:20px;" class="em_side15">&nbsp;</td>
                    </tr>
                  </table>
                  <!--[if gte mso 9]>
                </v:textbox>
                </v:fill>
                </v:rect>
                </v:image>
                <![endif]--></td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
         <td align="center" valign="top" bgcolor="#242424" style="padding: 35px 20px 30px 20px;" class="em_aside15"><table width="100%" border="0" cellspacing="0" cellpadding="0">
             <tr>
               <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                   <tbody>
                     <tr>
                       <td align="center" valign="top" style="color:#ffffff;font-weight:500;font-size:24px;line-height: 28px; font-family:'Roxborough', Arial,sans-serif;padding-bottom:20px;"> Order Confirmation</td>
                     </tr>
                     <tr>
                       <td align="center" valign="top" style="color:#ffffff;font-weight:500;font-size:24px;line-height: 28px; font-family:'Roxborough', Arial,sans-serif;padding-bottom:15px;"> Order #${
                         order.orderNumber || order._id
                       },</td>
                     </tr>
                     <tr>
                       <td align="center" valign="top" class="em_pbottom" style="color:#acacac;font-size:16px;line-height: 20px;padding-bottom: 30px; font-family:'Roxborough', Arial,sans-serif;">${
                         order?.payment?.date &&
                         new Date(order?.payment?.date).toLocaleDateString('en-US', {
                           weekday: 'long',
                           day: 'numeric',
                           month: 'long',
                           year: 'numeric',
                         })
                       }</td>
                     </tr>
                     ${orderItems(order)}
                     <tr>
                       <td align="center" valign="top" style="color:#ffffff;font-weight:300;font-size:14px;padding-top: 10px; padding-bottom:10px;line-height: 16px; font-family:'Roxborough', Arial,sans-serif;"><a href="${invoiceUrl}" style="color:#ffffff;text-decoration: underline;" target="_blank" >View Online Invoice </a></td>
                     </tr>
                   </tbody>
                 </table></td>
             </tr>
           </table></td>
        </tr>
      </table>
    </td>
  </tr>
</table>
`;
};

const orderSummary = (order: any) => {
  const {
    total,
    subtotal,
    itemsDiscountedAmount,
    totalDiscountedFromTotal,
    membersDiscount,
    tax,
    shipping,
  } = buildOrderForDisplay(order);
  return `
    ${lineItem(`Item/s Discount`, itemsDiscountedAmount, !!itemsDiscountedAmount, '- $')}
    ${lineItem(
      `Order discount`,
      totalDiscountedFromTotal,
      !!totalDiscountedFromTotal,
      '- $'
    )}
    ${lineItem(`Subtotal`, subtotal, true, '$')}
    ${lineItem(`Member discount`, membersDiscount, !!membersDiscount, '- $')}
    ${lineItem(`Shipping`, shipping, true, shipping === 'Complimentary' ? '' : '$')}
    ${lineItem(`Total - (Tax incl. $${tax})`, total, true, '$')}
    `;
};

const lineItem = (header: string, value: any, show = true, prefix: string) => {
  if (!show) return '';
  return `
                  <tr>
                    <td align="center" valign="top">
                      <table width="100%" border="0" cellspacing="0" cellpadding="0">
                        <tbody>
                          <tr>
                            <td align="center" valign="top" width="416" style="width:417px;" class="em_width80" >
                              <table align="center" width="417" style="width:417px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                                <tr>
                                  <td width="1" style="width: 1px;" bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                  <td align="center" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                        </tr>
                                        <tr>
                                          <td valign="top" class="em_font10" align="left" style="font-family:'Roxborough', Arial,sans-serif;padding: 6px 8px; font-weight: 500; color: #FFFFFF;line-height: 18px; font-size: 16px;" >${header}</td>
                                        </tr>
                                        <tr>
                                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td width="1" style="width: 1px;" bgcolor="#ffffff">
                                    <img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/>
                                  </td>
                                </tr>
                              </table>
                            </td>
                            <td align="center" valign="top" width="165" style="width:165px;" class="em_width20" >
                              <table align="center" width="165" style="width:165px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                                <tr>
                                  <td width="1" style="width: 1px;" bgcolor="#aaaaaa">
                                    <img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/>
                                  </td>
                                  <td align="center" valign="top">
                                    <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tbody>
                                        <tr>
                                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                        </tr>
                                        <tr>
                                          <td valign="top" class="em_font10" align="left" style="font-family:'Roxborough', Arial,sans-serif;padding: 6px 15px; font-weight: 500; color: #FFFFFF;line-height: 18px; font-size: 16px;" >${prefix}${value}</td>
                                        </tr>
                                        <tr>
                                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                        </tr>
                                      </tbody>
                                    </table>
                                  </td>
                                  <td width="1" style="width: 1px;" bgcolor="#ffffff">
                                    <img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/>
                                  </td>
                                </tr>
                              </table>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  </tr>                  
                  `;
};

const orderItems = (order: any) => {
  let items = '';

  order.items.forEach((item: any) => {
    items = `${items} 
      ${orderItem(item)}
    `;
  });
  return `
    <tr>
        <td align="center" valign="top">
          <table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                <td align="center" valign="top" >
                  <table width="582" style="width: 582px;" class="em_wrapper"  border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      ${tableHeader}
                      ${items}
                      ${orderSummary(order)}
                    </tbody>
                  </table>
                </td>
              </tr>
            </tbody>
          </table>
        </td>
      </tr>
    `;
};

const orderItem = (item: any) => {
  const _productName = item?.productName || item?.product?.name || 'Legacy Item';
  const _vintage = item?.product?.customFields.vintage || '';
  const _quantity = item.quantity.toString();
  const _purchasedPrice = ((item.purchasedPrice || item?.product?.price) / 100)
    .toFixed(2)
    .toString();

  return `
   <tr>
        <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
            <tbody>
              <tr>
                <td align="center" valign="top" ><table width="582" style="width: 582px;" class="em_wrapper"  border="0" cellspacing="0" cellpadding="0">
                    <tbody>
                      <tr>
                        <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                            <tbody>
                              <tr>
                                <td align="center" valign="top" style="width: 235px;" width="235" class="em_width40" ><table align="center" style="width: 235px;" width="235" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                                    <tr>
                                      <td width="1" style="width: 1px;" bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                      <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tbody>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                            <tr>
                                  <td valign="top" class="em_font10" align="left" style="font-family:'sweet-sans-pro', Arial,Helvetica,sans-serif;padding: 6px 8px; font-weight: 500; color: #FFFFFF;line-height: 16px; font-size: 14px;" >${_productName}</td>
                                            </tr>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                          </tbody>
                                        </table></td>
                                      <td width="1" style="width: 1px;" bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                    </tr>
                                  </table></td>
                                <td align="center" valign="top" width="88" style="width:88px;" class="em_width20" ><table align="center" width="88" style="width:88px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                                    <tr>
                                      <td width="1" style="width: 1px;" bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                      <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tbody>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                            <tr>
                                              <td valign="top" class="em_font10" align="center" style=" font-family:'sweet-sans-pro', Arial,Helvetica,sans-serif; font-weight: 500; color: #FFFFFF;padding: 6px 8px; line-height: 16px; font-size: 14px;" >${_vintage}</td>
                                            </tr>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                          </tbody>
                                        </table></td>
                                      <td width="1" style="width: 1px;" bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                    </tr>
                                  </table></td>
                                <td align="center" valign="top" width="94" style="width:94px;" class="em_width20" ><table align="center" width="94" style="width:94px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                                    <tr>
                                      <td width="1" style="width: 1px;" bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                      <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tbody>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                            <tr>
                                              <td valign="top" class="em_font10" align="center" style=" font-family:'sweet-sans-pro', Arial,Helvetica,sans-serif;font-weight: 500; color: #FFFFFF;padding: 6px 8px; line-height: 16px; font-size: 14px;" >${_quantity}</td>
                                            </tr>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                          </tbody>
                                        </table></td>
                                      <td width="1" style="width: 1px;" bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                    </tr>
                                  </table></td>
                                <td align="center" valign="top" width="165" style="width:165px;" class="em_width20" ><table align="center" width="165" style="width:165px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                                    <tr>
                                      <td width="1" style="width: 1px;" bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                      <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                                          <tbody>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#aaaaaa"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                            <tr>
                                              <td valign="top" class="em_font10" align="center" style=" font-family:'sweet-sans-pro', Arial,Helvetica,sans-serif; font-weight: 500; color: #FFFFFF;padding: 6px 8px; line-height: 16px; font-size: 14px;" >$${_purchasedPrice}</td>
                                            </tr>
                                            <tr>
                                              <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                            </tr>
                                          </tbody>
                                        </table></td>
                                      <td width="1" style="width: 1px;" bgcolor="#ffffff"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                                    </tr>
                                  </table></td>
                              </tr>
                            </tbody>
                          </table></td>
                      </tr>
                    </tbody>
                  </table></td>
              </tr>
            </tbody>
          </table></td>
      </tr>`;
};

const tableHeader = `
<tr>
  <td align="center" valign="top">
    <table width="100%" border="0" cellspacing="0" cellpadding="0">
      <tbody>
        <tr>
          <td align="center" valign="top" style="width: 235px;" width="235" class="em_width40" >
            <table align="center" style="width: 235px;" width="235" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                <tr>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a">
                    <img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/>
                  </td>
                  <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                        <tr>
                          <td valign="top" class="em_font12" align="left" style="font-family:'Roxborough', Arial,sans-serif;padding: 6px 8px; font-weight: 500; color: #FFFFFF;line-height: 18px; font-size: 16px;" >Product</td>
                        </tr>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                </tr>
            </table>
          </td>
          <td align="center" valign="top" width="88" style="width:88px;" class="em_width20" >
            <table align="center" width="88" style="width:88px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                <tr>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                  <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                        <tr>
                          <td valign="top" class="em_font12" align="left" style="font-family:'Roxborough', Arial,sans-serif;padding: 6px 8px; font-weight: 500; color: #FFFFFF;line-height: 18px; font-size: 16px;" >Vintage</td>
                        </tr>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                      </tbody>
                    </table></td>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                </tr>
             </table>
          </td>
          <td align="center" valign="top" width="94" style="width:94px;" class="em_width20" >
            <table align="center" width="94" style="width:94px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                <tr>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                  <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                        <tr>
                          <td valign="top" class="em_font12" align="left" style="font-family:'Roxborough', Arial,sans-serif;padding: 6px 8px; font-weight: 500; color: #FFFFFF;line-height: 18px; font-size: 16px;" > Quantity</td>
                        </tr>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                      </tbody>
                    </table></td>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                </tr>
            </table>
          </td>
          <td align="center" valign="top" width="165" style="width:165px;" class="em_width20" >
            <table align="center" width="165" style="width:165px;" border="0" cellspacing="0" cellpadding="0" class="em_wrapper">
                <tr>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                  <td align="center" valign="top"><table width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tbody>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                        <tr>
                          <td valign="top" class="em_font12" align="left" style=" font-family:'Roxborough', Arial,sans-serif;padding: 6px 8px; font-weight: 500; color: #FFFFFF;line-height: 18px; font-size: 16px;" > Price</td>
                        </tr>
                        <tr>
                          <td height="1" style="height: 1px;font-size: 0px;line-height: 0px;"  bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                        </tr>
                      </tbody>
                    </table></td>
                  <td width="1" style="width: 1px;" bgcolor="#937a4a"><img src="https://ci4.googleusercontent.com/proxy/o-87P_t8tfhxEI2dnHUJsPEdwMSFLrLC-KD1s_DReFT97fZ7cl370HPL1_io84jfhAgSY4IE6SP6Cp72Q9VAtHDUAPajCt6GY3slrQyxYxaRv6YsjnNMSXYyWAOc-xlsXH2YwcpiNEtupbH_Il5oQTt_E0OC_FfMry90vW_D-l7t=s0-d-e1-ft#https://image.email.hentleyfarm.com.au/lib/fe3211737164047d711c75/m/1/49b34536-4b4b-483f-84fd-19d1225cdbbc.gif" width="1" height="1" alt=" " border="0" style="display:block;"/></td>
                </tr>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </td>
</tr>`;
