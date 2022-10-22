import { MinusCircleIcon } from '@heroicons/react/24/solid';
import { useStateMachine } from 'little-state-machine';
import updateAction from '../../actions/updateAction';

interface IProps {
  section: string;
}
export default function UploadedFiles({ section }: IProps) {
  const { actions, state } = useStateMachine({ updateAction });

  return (
    <>
      {state.files && state.files.length > 0 ? <h3>Uploaded files</h3> : null}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {state.files
          ?.filter((x) => x.section === section)
          .map((file) => (
            <div
              className="relative h-52 flex items-center justify-center"
              key={file._id}
            >
              {file.mimetype?.toLowerCase().startsWith('image/') && (
                <img
                  src={`${file.url}`}
                  className="object-contain max-h-full"
                />
              )}
              <button
                className="btn btn-sm absolute right-2 bottom-2 bg-white"
                onClick={() => {
                  actions.updateAction({
                    ...state,
                    files: state.files.filter((f) => f._id !== file._id),
                  });
                }}
              >
                <MinusCircleIcon className="h-4 w-4" /> Remove
              </button>
            </div>
          ))}
      </div>
    </>
  );
}
