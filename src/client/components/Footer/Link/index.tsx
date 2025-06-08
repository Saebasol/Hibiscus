import { Grid } from "@radix-ui/themes"
import FooterLinkSupport from "./Support"
import FooterLinkResources from "./Resources"
import FooterLinkOpenSource from "./Opensource"
import FooterLinkCommunity from "./Community"

const FooterLink = () => {
  return (
    <Grid
      columns={{ initial: '2', sm: '4' }}
      gap="4"
      width="100%"
      style={{ maxWidth: '35rem' }}
    >
      <FooterLinkSupport />
      <FooterLinkResources />
      <FooterLinkOpenSource />
      <FooterLinkCommunity />
    </Grid>
  )
}

export default FooterLink