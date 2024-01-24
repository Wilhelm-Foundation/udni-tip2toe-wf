import { createContext, useEffect, useMemo, useReducer } from 'react';
import { Individual } from '../interfaces/phenopackets/schema/v2/core/individual';
import { PhenotypicFeature } from '../interfaces/phenopackets/schema/v2/core/phenotypic_feature';
import { Phenopacket } from '../interfaces/phenopackets/schema/v2/phenopackets';
import { ICustomFormData, PhenopacketDate } from '../types';
import { File as PhenopacketFile } from '../interfaces/phenopackets/schema/v2/core/base';
import SuggestedFeature from '../interfaces/suggested-feature';

export type Action =
  | { type: 'CLEAR' }
  | {
      type: 'SET_INDIVIDUAL';
      payload: Partial<Individual>;
    }
  | { type: 'SET_PHENOTYPIC_FEATURES'; payload: PhenotypicFeature[] }
  | {
      type: 'REMOVE_PHENOTYPIC_FEATURE';
      payload: { ontologyTypeId: string };
    }
  | {
      type: 'SET_PHENOTYPIC_FEATURE';
      payload: Partial<PhenotypicFeature>;
    }
  | {
      type: 'SEARCHED_PHENOTYPIC_FEATURE';
      payload: SuggestedFeature;
    }
  | {
      type: 'CONTINUE_FORM';
      payload: {
        phenoPacket: Partial<Phenopacket>;
        customFormData: ICustomFormData;
      };
    }
  | { type: 'REMOVE_FILE'; payload: PhenopacketFile }
  | { type: 'ADD_FILE'; payload: PhenopacketFile }
  | { type: 'CUSTOM_FORM_DATA'; payload: ICustomFormData }
  | { type: 'SET_AUTOSAVE'; payload: boolean };

export interface IAppContext {
  phenoPacket: Partial<Phenopacket>;
  autoSave: boolean;
  suggestedFeatures?: SuggestedFeature[];
  customFormData?: ICustomFormData;
}

const emptyState: IAppContext = {
  phenoPacket: {},
  autoSave: false,
  suggestedFeatures: [],
};

let initialState: IAppContext = {
  ...emptyState,
};

try {
  const tip2toeState = localStorage.getItem('tip2toeState');
  if (tip2toeState) initialState = JSON.parse(tip2toeState);
} catch (error) {}

const AppContext = createContext<{
  state: IAppContext;
  dispatch: React.Dispatch<Action>;
}>({
  state: initialState,
  dispatch: () => null,
});

const appReducer = (state: IAppContext, action: Action) => {
  switch (action.type) {
    case 'CLEAR':
      return emptyState;
    case 'SET_AUTOSAVE':
      // clears localstorage in useEffect below
      return { ...state, autoSave: action.payload as boolean };
    case 'SET_INDIVIDUAL':
      return {
        ...state,
        phenoPacket: {
          ...state.phenoPacket,
          subject: action.payload as Individual,
        },
      };
    case 'CONTINUE_FORM':
      const { phenoPacket, customFormData } = action.payload;
      if (
        phenoPacket.subject &&
        typeof phenoPacket.subject.dateOfBirth === 'object'
      )
        // @ts-expect-error string <-> date. Phenopacket date workaround.
        phenoPacket.subject.dateOfBirth = new Date(
          (
            phenoPacket.subject.dateOfBirth as unknown as PhenopacketDate
          ).seconds,
        ).toLocaleDateString();
      return {
        phenoPacket,
        customFormData,
        autoSave: false,
      };
    case 'REMOVE_PHENOTYPIC_FEATURE':
      return {
        ...state,
        phenoPacket: {
          ...state.phenoPacket,
          phenotypicFeatures: (
            state.phenoPacket.phenotypicFeatures || []
          ).filter((x) => x.type?.id !== action.payload.ontologyTypeId),
        },
      };
    case 'SET_PHENOTYPIC_FEATURE':
      const phenotypicFeature = action.payload as PhenotypicFeature;
      const phenotypicFeatures: PhenotypicFeature[] = (
        state.phenoPacket.phenotypicFeatures || []
      ).filter((x) => x.type?.id !== phenotypicFeature.type?.id);
      phenotypicFeatures.push(phenotypicFeature);
      return {
        ...state,
        phenoPacket: { ...state.phenoPacket, phenotypicFeatures },
      };
    case 'SEARCHED_PHENOTYPIC_FEATURE':
      return {
        ...state,
        suggestedFeatures: [...(state.suggestedFeatures || []), action.payload],
      };
    case 'SET_PHENOTYPIC_FEATURES':
      return {
        ...state,
        phenoPacket: {
          ...state.phenoPacket,
          phenotypicFeatures: action.payload as PhenotypicFeature[],
        },
      };
    case 'ADD_FILE':
      return {
        ...state,
        phenoPacket: {
          ...state.phenoPacket,
          files: [
            ...(state.phenoPacket.files || []),
            action.payload as PhenopacketFile,
          ],
        },
      };
    case 'REMOVE_FILE':
      return {
        ...state,
        phenoPacket: {
          ...state.phenoPacket,
          files: state.phenoPacket.files?.filter(
            (x) => x.uri !== action.payload.uri,
          ),
        },
      };
    case 'CUSTOM_FORM_DATA':
      return {
        ...state,
        customFormData: {
          ...state.customFormData,
          ...(action.payload as ICustomFormData),
        },
      };
  }
  throw new Error();
};

interface ProviderProps {
  children: React.ReactNode;
}

function AppProvider({ children }: ProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const contextValue = useMemo(() => {
    return { state, dispatch };
  }, [state, dispatch]);

  useEffect(() => {
    if (!state.autoSave) {
      try {
        localStorage.clear();
      } catch (error) {}
    }
  }, [state.autoSave]);

  useEffect(() => {
    if (state.autoSave) {
      localStorage.setItem('tip2toeState', JSON.stringify(state));
    }
  }, [state.customFormData, state.phenoPacket]);

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
}

export { AppProvider, AppContext };
