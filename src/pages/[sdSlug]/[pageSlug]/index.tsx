import { GetStaticPaths, GetStaticProps } from "next";
import { Loading, PageLayout, Theme } from "@/components";
import { ApiHelper, ChurchInterface, EnvironmentHelper, LinkInterface, PageInterface } from "@/helpers";
import { useEffect } from "react";

type Props = {
  pageData: any;
  church: ChurchInterface,
  churchSettings: any,
  navLinks: LinkInterface[],
};

export default function Home(props: Props) {
  useEffect(() => {
    if (EnvironmentHelper.shouldHideYourSite(props.church.id) && typeof window !== undefined) window.location.href = window.location.origin + "/member";
  }, []); //eslint-disable-line

  if (EnvironmentHelper.shouldHideYourSite(props.church.id)) return <Loading />
  else return (<>
    <Theme appearance={props.churchSettings} />
    <PageLayout church={props.church} churchSettings={props.churchSettings} navLinks={props.navLinks} pageData={props.pageData} />
  </>);
}

export const getStaticPaths: GetStaticPaths = async () => {

  //{ params: { sdSlug: "crcc", page: "newhere" } },
  //{ params: { sdSlug: "ironwood", page: "" } },

  // leaving it empty as we don't know what routes could be.
  // as we've fallback as "blocking" it doesn't matter. The first time a route it called
  // it'll run as SSR and then cached - https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking
  const paths = [

  ];

  return { paths, fallback: "blocking", };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {

  const church: ChurchInterface = await ApiHelper.getAnonymous("/churches/lookup?subDomain=" + params.sdSlug, "MembershipApi");
  const churchSettings: any = await ApiHelper.getAnonymous("/settings/public/" + church.id, "MembershipApi");
  const navLinks: any = await ApiHelper.getAnonymous("/links/church/" + church.id + "?category=website", "ContentApi");

  const pageData: PageInterface = await ApiHelper.getAnonymous("/pages/" + church.id + "/tree?url=" + params.pageSlug, "ContentApi");

  return {
    props: { pageData, church, churchSettings, navLinks },
    revalidate: 30,
  };
};
