import React, { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { getPatient, getInvestigation } from "../../Redux/actions";
import { ConsultationModel } from "./models";
import { statusType, useAbortableEffect } from "../../Common/utils";
import { PatientModel, DailyRoundsModel } from "../Patient/models";
import loadable from "@loadable/component";
import moment from "moment";
import { getConsultation } from "../../Redux/actions";
import { GENDER_TYPES } from "../../Common/constants";
const Loading = loadable(() => import("../Common/Loading"));

const TreatmentSummary = (props: any) => {
  const { consultationId, patientId } = props;
  const date = new Date();
  const dispatch: any = useDispatch();
  const [patientData, setPatientData] = useState<PatientModel>({});
  const [consultationData, setConsultationData] = useState<ConsultationModel>(
    {}
  );
  const [isLoading, setIsLoading] = useState(false);
  const [investigations, setInvestigations] = useState<Array<any>>([]);
  const [dailyRounds, setDailyRounds] = useState<any>({});

  const fetchPatientData = useCallback(
    async (status: statusType) => {
      setIsLoading(true);
      const res = await dispatch(getPatient({ id: patientId }));
      if (!status.aborted) {
        if (res && res.data) {
          setPatientData(res.data);
        } else {
          setPatientData({});
        }
      }
      setIsLoading(false);
    },
    [patientId, dispatch]
  );

  const fetchInvestigationData = useCallback(
    async (status: statusType) => {
      setIsLoading(true);
      const res = await dispatch(getInvestigation({}, consultationId));

      if (!status.aborted) {
        if (res && res?.data?.results) {
          const valueMap = res.data.results.reduce(
            (acc: any, cur: { id: any }) => ({ ...acc, [cur.id]: cur }),
            {}
          );
          setInvestigations(valueMap);
        } else {
          setInvestigations([]);
        }
      }
      setIsLoading(false);
    },
    [consultationId, dispatch]
  );

  const fetchConsultation = useCallback(
    async (status: statusType) => {
      setIsLoading(true);
      const [res] = await Promise.all([
        dispatch(getConsultation(consultationId)),
      ]);
      if (!status.aborted) {
        if (res && res.data) {
          setConsultationData(res.data);
          if (res.data.last_daily_round) {
            setDailyRounds(res.data.last_daily_round);
          }
        } else {
          setConsultationData({});
        }
      }
      setIsLoading(false);
    },
    [consultationId, dispatch]
  );

  useAbortableEffect((status: statusType) => {
    fetchPatientData(status);
    fetchInvestigationData(status);

    fetchConsultation(status);
  }, []);

  return (
    <div>
      {isLoading ? (
        <Loading />
      ) : (
        <div className="my-4">
          <div className="my-4 flex justify-end ">
            <button
              onClick={(_) => window.print()}
              className="btn btn-primary mr-2"
            >
              <i className="fas fa-print mr-2"></i> Print Treatment Summary
            </button>
            <button
              onClick={(_) => window.history.go(-1)}
              className="btn btn-default"
            >
              <i className="fas fa-times mr-2"></i> Close
            </button>
          </div>

          <div id="section-to-print" className="mx-5">
            <h2 className="text-center text-lg">
              {consultationData.facility_name}
            </h2>

            <h2 className="text-center text-lg">INTERIM TREATMENT SUMMARY</h2>

            <div className="text-right font-bold">
              {moment(date).format("DD/MM/YYYY")}
            </div>

            <div className="mt-2 mb-5 border border-gray-800">
              <div className="border-b-2 border-gray-800 grid grid-cols-3">
                <div className="col-span-1 py-2 px-3 border-r-2 border-gray-800">
                  <b>Name :</b> {patientData.name}
                </div>
                <div className="col-span-1 py-2 px-3">
                  <b>Address :</b> {patientData.address}
                </div>
              </div>

              <div className="border-b-2 border-gray-800 grid grid-cols-3">
                <div className="col-span-1 py-2 px-3 border-r-2 border-gray-800">
                  <b>Age :</b> {patientData.age}
                </div>
                <div className="col-span-1 py-2 px-3 border-r-2 border-gray-800">
                  <b>Date of admission :</b>
                  <span>
                    {consultationData.admitted
                      ? moment(consultationData.admission_date).format(
                          "DD/MM/YYYY"
                        )
                      : " ---"}
                  </span>
                </div>
                <div className="col-span-1 py-2 px-3">
                  <b>Date of positive :</b>
                  {patientData.date_of_result
                    ? moment(patientData.date_of_result).format("DD/MM/YYYY")
                    : " ---"}
                </div>
              </div>

              <div className="border-b-2 border-gray-800 grid grid-cols-3">
                <div className="col-span-1 py-2 px-3 border-r-2 border-gray-800">
                  <b>Gender :</b>
                  {GENDER_TYPES.find((i) => i.id === patientData.gender)?.text}
                </div>

                <div className="col-span-1 py-2 px-3 border-r-2 border-gray-800">
                  <b>Contact person :</b>
                  <span>
                    {" "}
                    {patientData.emergency_phone_number
                      ? patientData.emergency_phone_number
                      : "   -"}
                  </span>
                </div>

                <div className="col-span-1 py-2 px-3">
                  <b>Date of negative :</b>
                  <span>
                    {patientData.disease_status == "NEGATIVE"
                      ? moment(patientData.modified_date).format("DD/MM/YYYY")
                      : " ---"}
                  </span>
                </div>
              </div>

              <div className="border-b-2 border-gray-800 px-5 py-2">
                <b>Comorbidities :</b>
                <div className="mx-5">
                  <table className="border-collapse border border-gray-800 w-full">
                    <thead>
                      <tr>
                        <th className="border border-gray-800">Disease</th>
                        <th className="border border-gray-800">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientData.medical_history &&
                      patientData.medical_history.length > 0 ? (
                        patientData.medical_history.map(
                          (obj: any, index: number) => {
                            return (
                              <tr key={index}>
                                <td className="border border-gray-800 text-center">
                                  {obj["disease"]}
                                </td>
                                <td className="border border-gray-800 text-center">
                                  {obj["details"] ? obj["details"] : "---"}
                                </td>
                              </tr>
                            );
                          }
                        )
                      ) : (
                        <tr>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b-2 border-gray-800 px-5 py-2">
                <b>Diagnosis :</b>
                <div className="mx-5">
                  <div>
                    <b>History of present illness :</b>
                    {consultationData.history_of_present_illness
                      ? consultationData.history_of_present_illness
                      : "    ---"}
                  </div>

                  <div>
                    <b>Examination details and clinical conditions :</b>
                    {consultationData.examination_details
                      ? consultationData.examination_details
                      : "    ---"}
                  </div>

                  <div>
                    <b>Diagnosis :</b>
                    {consultationData.diagnosis
                      ? consultationData.diagnosis
                      : "    ---"}
                  </div>

                  <div>
                    <b>Physical Examination info :</b>
                    {dailyRounds.physical_examination_info
                      ? dailyRounds.physical_examination_info
                      : "    ---"}
                  </div>
                </div>
              </div>

              <div className="border-b-2 border-gray-800 px-5 py-2">
                <b>General Instructions :</b>
                {patientData.last_consultation &&
                patientData.last_consultation.consultation_notes ? (
                  <div className="mx-5">
                    {patientData.last_consultation.consultation_notes}
                  </div>
                ) : (
                  " ---"
                )}
              </div>

              <div className="border-b-2 border-gray-800 px-5 py-2">
                <b>Relevant investigations :</b>

                <div className="mx-5">
                  <table className="border-collapse border border-gray-800 w-full">
                    <thead>
                      <tr>
                        <th className="border border-gray-800 text-center">
                          Date
                        </th>
                        <th className="border border-gray-800 text-center">
                          Name
                        </th>
                        <th className="border border-gray-800 text-center">
                          Result
                        </th>
                        <th className="border border-gray-800 text-center">
                          Ideal value
                        </th>
                        <th className="border border-gray-800 text-center">
                          values range
                        </th>
                        <th className="border border-gray-800 text-center">
                          unit
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {Object.values(investigations).length > 0 ? (
                        Object.values(investigations).map(
                          (value: any, index: number) => {
                            return (
                              <tr key={index}>
                                <td className="border border-gray-800 text-center">
                                  {moment(
                                    value["session_object"][
                                      "session_created_date"
                                    ]
                                  ).format("DD/MM/YYYY")}
                                </td>
                                <td className="border border-gray-800 text-center">
                                  {value["investigation_object"]["name"]}
                                </td>
                                <td className="border border-gray-800 text-center">
                                  {value["notes"] || value["value"]}
                                </td>
                                <td className="border border-gray-800 text-center">
                                  {value["investigation_object"][
                                    "ideal_value"
                                  ] || "-"}
                                </td>
                                <td className="border border-gray-800 text-center">
                                  {value["investigation_object"]["min_value"]} -{" "}
                                  {value["investigation_object"]["max_value"]}
                                </td>
                                <td className="border border-gray-800 text-center">
                                  {value["investigation_object"]["unit"] || "-"}
                                </td>
                              </tr>
                            );
                          }
                        )
                      ) : (
                        <tr>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-b-2 border-gray-800 py-2 px-5">
                <b>Treatment :</b>
                {consultationData.prescribed_medication ? (
                  <p className="ml-4">
                    {consultationData.prescribed_medication}
                  </p>
                ) : (
                  <p className="ml-4">---</p>
                )}
                <b className="mb-2">Treatment summary/Treament Plan :</b>

                <div className="mx-5">
                  <table className="border-collapse border border-gray-800 w-full">
                    <thead>
                      <tr>
                        <th className="border border-gray-800">Date</th>
                        <th className="border border-gray-800">Spo2</th>
                        <th className="border border-gray-800">Temperature</th>
                      </tr>
                    </thead>

                    <tbody>
                      {dailyRounds ? (
                        <tr>
                          <td className="border border-gray-800 text-center">
                            {moment(dailyRounds.modified_date).format(
                              "DD/MM/YYYY (h:mm A)"
                            )}
                          </td>
                          <td className="border border-gray-800 text-center">
                            {dailyRounds.ventilator_spo2 || "-"}
                          </td>
                          <td className="border border-gray-800 text-center">
                            {dailyRounds.temperature || "-"}
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                          <td className="border border-gray-800 text-center">
                            ---
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TreatmentSummary;
