import { useState, useEffect } from "react";
import {
  ApiHelper,
  ServiceInterface,
  CheckinHelper,
  PersonHelper,
  ArrayHelper,
  GroupServiceTimeInterface,
  GroupInterface,
} from "@/helpers";
import { Loading } from "@/components";

interface Props {
  selectedHandler: () => void;
}

export function Services({ selectedHandler }: Props) {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [services, setServices] = useState<ServiceInterface[]>([]);

  const loadData = () => {
    setIsLoading(true);
    ApiHelper.get("/services", "AttendanceApi").then((data) => {
      setServices(data);
      setIsLoading(false);
    });
  };

  const selectService = async (serviceId: string) => {
    setIsLoading(true);

    const promises: Promise<any>[] = [
      ApiHelper.get("/servicetimes?serviceId=" + serviceId, "AttendanceApi").then((times) => {
        CheckinHelper.serviceId = serviceId;
        CheckinHelper.serviceTimes = times;
      }),
      ApiHelper.get("/groupservicetimes", "AttendanceApi").then((groupServiceTimes) => {
        CheckinHelper.groupServiceTimes = groupServiceTimes;
      }),
      ApiHelper.get("/groups", "MembershipApi").then((groups) => {
        CheckinHelper.groups = groups;
      }),
      ApiHelper.get("/people/household/" + PersonHelper.person.householdId, "MembershipApi").then((members) => {
        CheckinHelper.householdMembers = members;
      }),
    ];
    await Promise.all(promises);
    const peopleIds: number[] = ArrayHelper.getUniqueValues(CheckinHelper.householdMembers, "id");
    const url =
      "/visits/checkin?serviceId=" +
      CheckinHelper.serviceId +
      "&peopleIds=" +
      escape(peopleIds.join(",")) +
      "&include=visitSessions";
    CheckinHelper.existingVisits = await ApiHelper.get(url, "AttendanceApi");
    CheckinHelper.pendingVisits = [...CheckinHelper.existingVisits];

    //for simplicity, iterate the group service times and add groups to the services.
    CheckinHelper.serviceTimes.forEach((st) => {
      st.groups = [];
      ArrayHelper.getAll(CheckinHelper.groupServiceTimes, "serviceTimeId", st.id).forEach(
        (gst: GroupServiceTimeInterface) => {
          const g: GroupInterface = ArrayHelper.getOne(CheckinHelper.groups, "id", gst.groupId);
          st.groups?.push(g);
        }
      );
    });

    setIsLoading(false);
    selectedHandler();
  };

  useEffect(loadData, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <h2>Select a service:</h2>
      {services?.map((service) => (
        <a
          href="about:blank"
          className="bigLinkButton"
          onClick={(e) => {
            e.preventDefault();
            selectService(service.id);
          }}
        >
          {service.campus.name} - {service.name}
        </a>
      ))}
    </>
  );
}
