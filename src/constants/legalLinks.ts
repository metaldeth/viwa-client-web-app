export const LEGAL_OFFER_URL = '/legal/oferta_663903715112.docx';
export const LEGAL_PERSONAL_DATA_URL = '/legal/personal_data_rule.docx';
export const LEGAL_CONTACT_EMAIL = 'klukin1988@mail.ru';
export const LEGAL_CONTACT_PHONE = '+79045449783';
export const LEGAL_CONTACT_PHONE_DISPLAY = '+7 904 544-97-83';

export type LegalRequisiteFieldKey =
  | 'legalReqInn'
  | 'legalReqName'
  | 'legalReqAddress'
  | 'legalReqOgrn'
  | 'legalReqAccount'
  | 'legalReqBank'
  | 'legalReqBik'
  | 'legalReqCorrAccount';

export type LegalRequisiteField = {
  labelKey: LegalRequisiteFieldKey;
  value: string;
};

export const LEGAL_REQUISITES: LegalRequisiteField[] = [
  { labelKey: 'legalReqInn', value: '663903715112' },
  { labelKey: 'legalReqName', value: 'ИП Клюкин Илья Александрович' },
  {
    labelKey: 'legalReqAddress',
    value:
      'Свердловская область, городской округ город Екатеринбург, город Екатеринбург, улица Латвийская, дом 56, квартира 319',
  },
  { labelKey: 'legalReqOgrn', value: '325665800010040' },
  { labelKey: 'legalReqAccount', value: '4080 2810 7129 8000 2448' },
  { labelKey: 'legalReqBank', value: 'Филиал «Центральный» Банка ВТБ (ПАО) г Москва' },
  { labelKey: 'legalReqBik', value: '044525411' },
  { labelKey: 'legalReqCorrAccount', value: '3010 1810 1452 5000 0411' },
];
