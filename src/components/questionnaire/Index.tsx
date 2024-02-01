import { useTranslation } from 'react-i18next';

export default function Questionnaire() {
  const { t } = useTranslation();
  return (
    <div>
      <h2>{t('global.questionnaire')}</h2>
      <p>
        Step through each section. Some information might be difficult to
        obtain. In this case the local UDP referral should write "Not
        investigated".
      </p>

      {/* <Overview /> */}
    </div>
  );
}
