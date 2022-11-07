const saleshelpers = require('../helpers/sales_helpers');
const sales_helpers = require('../helpers/sales_helpers');


module.exports.salesReport=async(req,res)=>{
    let monthlysales=await sales_helpers.monthlySalesreport()
    let yearlysales=await sales_helpers.yearlySalesReport()
    saleshelpers.dailySalesReport().then((dailysales)=>{
      res.render('admin/admin_salesreport',{admin:true,dailysales,monthlysales,yearlysales})
    })
  }