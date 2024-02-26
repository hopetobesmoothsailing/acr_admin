// ExportToExcel.jsx
import React from 'react';
import * as XLSX from 'xlsx';
import PropTypes from 'prop-types';
import * as FileSaver from 'file-saver'

import Button  from '@mui/material/Button';
 
const ExportExcel = ({ exdata, fileName,idelem }) => {
      const fileType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet charset=utf-8"
      const fileExtension = ".xlsx"

      const exportToExcel = async () => {
        // const ws = XLSX.utils.json_to_sheet(exdata);
        const ws = XLSX.utils.table_to_sheet(document.getElementById(idelem));
    
        const wb = {Sheets: {'data':ws},SheetNames: ['data']};
        const excelBuffer = XLSX.write(wb,{bookType:'xlsx',type:'array'});
        const data = new Blob([excelBuffer],{type:fileType});
        FileSaver.saveAs(data,fileName + fileExtension);
      }

      return (
          <Button sx={{ml: 2, mt: 0,mb:0, mr:2}} variant="contained" onClick={(e) => exportToExcel(fileName)} color="primary" >
            Esporta in Excel
          </Button>
      );


}
ExportExcel.propTypes = {
  exdata: PropTypes.array.isRequired,
  fileName: PropTypes.string.isRequired,
  idelem: PropTypes.string.isRequired,
};
export default ExportExcel;