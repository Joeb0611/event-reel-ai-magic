
import QRCodeManager from '@/components/QRCodeManager';
import { Project } from '@/hooks/useProjects';

interface QRCodeSectionProps {
  project: Project;
}

const QRCodeSection = ({ project }: QRCodeSectionProps) => {
  return <QRCodeManager project={project} />;
};

export default QRCodeSection;
