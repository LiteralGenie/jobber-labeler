import * as React from "react"
import useAutocomplete, { AutocompleteGetTagProps } from "@mui/base/useAutocomplete"
import CheckIcon from "@mui/icons-material/Check"
import CloseIcon from "@mui/icons-material/Close"
import { styled } from "@mui/material/styles"
import { autocompleteClasses } from "@mui/material/Autocomplete"

// https://mui.com/material-ui/react-autocomplete/

const Root = styled("div")(
    ({ theme }) => `
        color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,.85)"};
        font-size: 14px;
    `
)

const Container = styled("div")(
    () => `
        display: flex;
        flex-flow: row;
        align-items: stretch;
        justify-content: flex-start;

        background-color: #141414;
        border: 1px solid #434343;
        border-radius: 4px;
        overflow: hidden;
        
        &:hover, &:focus {
            border-color: #177ddc;
            box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
        }
    `
)

const InputWrapper = styled("div")(
    ({ theme }) => `
    width: 300px;
    border-radius: 4px;
    padding: 1px;
    display: flex;
    flex-wrap: wrap;

    & input {
        background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
        color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.65)" : "rgba(0,0,0,.85)"};
        height: 30px;
        box-sizing: border-box;
        padding: 4px 6px;
        width: 0;
        min-width: 30px;
        flex-grow: 1;
        border: 0;
        margin: 0;
        outline: 0;
    }
`
)

interface TagProps extends ReturnType<AutocompleteGetTagProps> {
    label: string
}

function Tag(props: TagProps) {
    const { label, onDelete, ...other } = props
    return (
        <div {...other}>
            <span>{label}</span>
            <CloseIcon onClick={onDelete} />
        </div>
    )
}

const StyledTag = styled(Tag)<TagProps>(
    ({ theme }) => `
    display: flex;
    align-items: center;
    height: 24px;
    margin: 2px;
    line-height: 22px;
    background-color: ${theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "#fafafa"};
    border: 1px solid ${theme.palette.mode === "dark" ? "#303030" : "#e8e8e8"};
    border-radius: 2px;
    box-sizing: content-box;
    padding: 0 4px 0 10px;
    outline: 0;
    overflow: hidden;

    &:focus {
        border-color: ${theme.palette.mode === "dark" ? "#177ddc" : "#40a9ff"};
        background-color: ${theme.palette.mode === "dark" ? "#003b57" : "#e6f7ff"};
    }

    & span {
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    & svg {
        font-size: 12px;
        cursor: pointer;
        padding: 4px;
    }
`
)

const Listbox = styled("ul")(
    ({ theme }) => `
    width: 300px;
    margin: 2px 0 0;
    padding: 0;
    position: absolute;
    list-style: none;
    background-color: ${theme.palette.mode === "dark" ? "#141414" : "#fff"};
    overflow: auto;
    max-height: 250px;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1;

    & li {
        padding: 5px 12px;
        display: flex;

        & span {
            flex-grow: 1;
        }

        & svg {
            color: transparent;
        }
    }

    & li[aria-selected='true'] {
        background-color: ${theme.palette.mode === "dark" ? "#2b2b2b" : "#fafafa"};
        font-weight: 600;

      & svg {
          color: #1890ff;
      }
    }

    & li.${autocompleteClasses.focused} {
        background-color: ${theme.palette.mode === "dark" ? "#003b57" : "#e6f7ff"};
        cursor: pointer;

        & svg {
           color: currentColor;
        }
    }
`
)

export default function AutocompleteChips({
    label,
    options,
    className,
}: {
    label: string
    options: string[]
    className?: string
}) {
    const {
        getRootProps,
        getInputProps,
        getTagProps,
        getListboxProps,
        getOptionProps,
        groupedOptions,
        value,
        focused,
    } = useAutocomplete({
        multiple: true,
        options: options,
    })

    // Suppress "A props object containing a "key" prop is being spread into JSX"
    function removeKeyWarning(option: string, index: number) {
        const optionProps = getOptionProps({ option, index }) as any
        const key = optionProps.key
        const rest = { ...optionProps }
        delete rest.key
        return { key, rest }
    }

    return (
        <Root className={className}>
            <Container>
                {/* Label */}
                <div
                    style={{
                        alignItems: "center",
                        backgroundColor: "hsl(0, 0%, 12%)",
                        borderRight: "1px solid #303030",
                        display: "flex",
                        fontSize: "0.75rem",
                        padding: "0 0.5rem",
                        justifyContent: "center",
                        width: 100,
                    }}
                >
                    <span>{label}</span>
                </div>

                <div>
                    {/* Input */}
                    <div {...getRootProps()}>
                        <InputWrapper className={focused ? "focused" : ""}>
                            {value.map((option: string, index: number) => (
                                <StyledTag label={option} {...getTagProps({ index })} />
                            ))}
                            <input {...getInputProps()} />
                        </InputWrapper>
                    </div>

                    {/* Options dropdown */}
                    {groupedOptions.length > 0 ? (
                        <Listbox {...getListboxProps()} style={{ zIndex: 2 }}>
                            {(groupedOptions as string[]).map((option, index) => {
                                const { key, rest } = removeKeyWarning(option, index)
                                return (
                                    <li key={key} {...rest}>
                                        <span>{option}</span>
                                        <CheckIcon fontSize="small" />
                                    </li>
                                )
                            })}
                        </Listbox>
                    ) : null}
                </div>
            </Container>
        </Root>
    )
}
