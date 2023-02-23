import { Wrapper } from "@/components";
import { EnvironmentHelper, ConfigHelper, WrapperPageProps } from "@/helpers";
import { GetStaticPaths, GetStaticProps } from "next";

export default function Lessons(props: WrapperPageProps) {
  return (
    <Wrapper config={props.config}>
      <iframe
        title="content"
        className="full-frame"
        src={EnvironmentHelper.Common.LessonsRoot + "/b1/" + props.config.church.id}
      />
    </Wrapper>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = [];
  return { paths, fallback: "blocking", };
};


export const getStaticProps: GetStaticProps = async ({ params }) => {
  const config = await ConfigHelper.load(params.sdSlug.toString());
  return { props: { config }, revalidate: 30 };
};
