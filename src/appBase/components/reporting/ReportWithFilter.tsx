import React from "react";
import { ReportInterface, ReportPermissionInterface } from "../../interfaces";
import { ApiHelper, UserHelper } from "../../helpers"
import { Loading } from "../Loading"
import { Grid } from "@mui/material"
import { ReportOutput } from "./ReportOutput"
import { ReportFilter } from "./ReportFilter"
import useMountedState from "../../hooks/useMountedState";

interface Props { keyName: string, autoRun: boolean }

export const ReportWithFilter = (props: Props) => {
  const [report, setReport] = React.useState<ReportInterface>(null);
  const [reportToRun, setReportToRun] = React.useState<ReportInterface>(null);
  const isMounted = useMountedState();

  const loadData = () => {
    setReportToRun(null);
    setReport(null);
    ApiHelper.get("/reports/" + props.keyName, "ReportingApi").then(data => {
      if(isMounted()) {
        setReport(data);
      }
    });
  }

  const handleAutoRun = () => {
    if (props.autoRun && report) {
      setReportToRun(report);
    }
  }

  React.useEffect(loadData, [props.keyName, isMounted]);
  React.useEffect(handleAutoRun, [report, props.autoRun]);

  const handleRun = () => { setReportToRun(report); }

  const handleChange = (r: ReportInterface) => setReport(r);

  const checkAccess = () => {
    let result = true;
    report.permissions.forEach(rpg => {
      let groupResult = checkGroup(rpg.requireOne);
      if (!groupResult) result = false;  //between groups use AND
    })
    return result;
  }

  //Within groups use OR
  const checkGroup = (pa: ReportPermissionInterface[]) => {
    let result = false;
    pa.forEach(p => {
      if (UserHelper.checkAccess(p)) result = true;
    });
    return result;
  }

  if (!report) return <Loading />
  if (!checkAccess()) return <></>
  else {
    return (<Grid container spacing={3}>
      <Grid item md={8} xs={12}>
        <ReportOutput report={reportToRun} />
      </Grid>
      <Grid item md={4} xs={12}>
        <ReportFilter report={report} onChange={handleChange} onRun={handleRun} />
      </Grid>
    </Grid>)
  }
}
