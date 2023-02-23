import { SmallButton } from "@/appBase/components";
import { ElementInterface, SectionInterface } from "@/helpers";
import { Container } from "@mui/material";
import { DraggableIcon } from "./admin/DraggableIcon";
import { Section } from "./Section";


interface Props {
  first?: boolean,
  section: SectionInterface,
  churchId?: string;
  churchSettings: any;
  onEdit?: (section: SectionInterface, element: ElementInterface) => void
  onMove?: () => void
}

export const SectionBlock: React.FC<Props> = props => {

  const getEdit = () => {
    if (props.onEdit) {
      return (
        <div className="sectionActions alwaysVisible">
          <table style={{ float: "right" }}>
            <tbody>
              <tr>
                <td><DraggableIcon dndType="section" elementType="section" data={props.section} /></td>
                <td>
                  <div className="sectionEditButton">
                    <SmallButton icon="edit" onClick={() => props.onEdit(props.section, null)} />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );
    }
  }

  const getSections = () => {
    const result: JSX.Element[] = []
    props.section.sections.forEach(section => {
      result.push(<Section key={section.id} section={section} churchSettings={props.churchSettings} />)
    });
    return result;
  }

  return (<div style={{ minHeight: 30, position: "relative" }}>
    {getEdit()}
    {getSections()}
  </div>);
}
